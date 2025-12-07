import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';
import { aiService } from './ai.service';
import pdfParse from 'pdf-parse';

let imapConnection: Imap | null = null;
let pollingInterval: NodeJS.Timeout | null = null;

/**
 * Start polling for new emails
 */
export function startEmailPolling() {
  if (!process.env.IMAP_HOST || !process.env.IMAP_USER || !process.env.IMAP_PASSWORD) {
    logger.warn('IMAP not configured, skipping email polling');
    return;
  }

  const pollInterval = parseInt(process.env.EMAIL_POLL_INTERVAL || '300000'); // 5 minutes default

  // Poll immediately, then set interval
  pollForEmails();
  pollingInterval = setInterval(pollForEmails, pollInterval);

  logger.info(`Email polling started (interval: ${pollInterval}ms)`);
}

/**
 * Stop email polling
 */
export function stopEmailPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  if (imapConnection) {
    imapConnection.end();
    imapConnection = null;
  }
}

/**
 * Poll IMAP for new emails
 */
async function pollForEmails() {
  try {
    const imap = new Imap({
      user: process.env.IMAP_USER!,
      password: process.env.IMAP_PASSWORD!,
      host: process.env.IMAP_HOST!,
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: process.env.IMAP_TLS !== 'false',
      tlsOptions: { rejectUnauthorized: false }
    });

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          logger.error('Error opening inbox:', err);
          imap.end();
          return;
        }

        // Search for unread emails
        imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            logger.error('Error searching emails:', err);
            imap.end();
            return;
          }

          if (!results || results.length === 0) {
            logger.debug('No new emails found');
            imap.end();
            return;
          }

          logger.info(`Found ${results.length} new email(s)`);

          const fetch = imap.fetch(results, { bodies: '', struct: true });
          fetch.on('message', (msg, seqno) => {
            processEmailMessage(msg, seqno);
          });

          fetch.once('end', () => {
            imap.end();
          });
        });
      });
    });

    imap.once('error', (err) => {
      logger.error('IMAP error:', err);
    });

    imap.connect();
  } catch (error) {
    logger.error('Error in email polling:', error);
  }
}

/**
 * Process a single email message
 */
async function processEmailMessage(msg: any, seqno: number) {
  try {
    const parsed = await simpleParser(msg);

    // Check if this is a reply to an RFP email (subject contains "RFP:" or "Re:")
    const isRFPResponse = parsed.subject?.toLowerCase().includes('rfp') || 
                         parsed.subject?.toLowerCase().startsWith('re:');

    if (!isRFPResponse) {
      logger.debug(`Skipping non-RFP email: ${parsed.subject}`);
      return;
    }

    // Try to find vendor by email
    const vendor = await prisma.vendor.findUnique({
      where: { email: parsed.from?.text || '' }
    });

    if (!vendor) {
      logger.warn(`Vendor not found for email: ${parsed.from?.text}`);
      // Still save the email for manual processing
    }

    // Extract text from attachments
    const attachmentsText: string[] = [];
    if (parsed.attachments) {
      for (const attachment of parsed.attachments) {
        try {
          if (attachment.contentType === 'application/pdf') {
            const pdfBuffer = Buffer.from(attachment.content);
            const pdfData = await pdfParse(pdfBuffer);
            attachmentsText.push(pdfData.text);
          } else if (attachment.contentType?.includes('text')) {
            attachmentsText.push(attachment.content.toString());
          }
        } catch (err) {
          logger.warn(`Error parsing attachment ${attachment.filename}:`, err);
        }
      }
    }

    // Save email to database
    const email = await prisma.email.create({
      data: {
        messageId: parsed.messageId,
        from: parsed.from?.text || parsed.from?.value[0]?.address || 'unknown',
        to: parsed.to?.text || parsed.to?.value[0]?.address || '',
        subject: parsed.subject || 'No Subject',
        body: parsed.text || parsed.html || '',
        attachments: parsed.attachments ? parsed.attachments.map((a: any) => ({
          filename: a.filename,
          contentType: a.contentType,
          size: a.size
        })) : null,
        direction: 'inbound',
        status: 'pending',
        vendorId: vendor?.id
      }
    });

    logger.info(`Saved email: ${email.id} from ${email.from}`);

    // If vendor found, try to find associated RFP and create proposal
    if (vendor) {
      // Find most recent RFP sent to this vendor
      const recentRFPEmail = await prisma.email.findFirst({
        where: {
          vendorId: vendor.id,
          direction: 'outbound',
          rfpId: { not: null }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (recentRFPEmail?.rfpId) {
        await processProposal(email.id, recentRFPEmail.rfpId, vendor.id, parsed.text || '', attachmentsText);
      }
    }
  } catch (error) {
    logger.error(`Error processing email message ${seqno}:`, error);
  }
}

/**
 * Process proposal from email
 */
async function processProposal(
  emailId: string,
  rfpId: string,
  vendorId: string,
  emailBody: string,
  attachmentsText: string[]
) {
  try {
    // Get RFP requirements
    const rfp = await prisma.rFP.findUnique({
      where: { id: rfpId }
    });

    if (!rfp) {
      logger.warn(`RFP not found: ${rfpId}`);
      return;
    }

    // Parse proposal with AI
    const extractedData = await aiService.parseProposal(
      emailBody,
      attachmentsText,
      rfp.requirements
    );

    // Calculate compliance score
    const complianceScore = calculateComplianceScore(extractedData, rfp.requirements);

    // Create proposal
    const proposal = await prisma.proposal.create({
      data: {
        rfpId,
        vendorId,
        status: 'parsed',
        rawContent: emailBody,
        attachmentsUrls: attachmentsText.length > 0 ? attachmentsText : null,
        extractedData,
        complianceScore,
        parsedAt: new Date()
      }
    });

    // Update email status
    await prisma.email.update({
      where: { id: emailId },
      data: { status: 'processed', rfpId }
    });

    logger.info(`Created proposal: ${proposal.id} for RFP ${rfpId}`);
  } catch (error) {
    logger.error('Error processing proposal:', error);
  }
}

/**
 * Calculate compliance score (0-100)
 */
function calculateComplianceScore(proposalData: any, rfpRequirements: any): number {
  let score = 0;
  let factors = 0;

  // Check if pricing provided
  if (proposalData.pricing?.total || proposalData.pricing?.items?.length > 0) {
    score += 30;
  }
  factors++;

  // Check if terms provided
  if (proposalData.terms) {
    if (proposalData.terms.payment) score += 15;
    if (proposalData.terms.warranty) score += 15;
    if (proposalData.terms.delivery) score += 15;
    factors += 3;
  }

  // Check compliance
  if (proposalData.compliance?.meetsRequirements) {
    score += 25;
  }
  factors++;

  return Math.round((score / (factors * 25)) * 100);
}

