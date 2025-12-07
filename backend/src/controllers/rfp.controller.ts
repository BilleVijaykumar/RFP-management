import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { aiService } from '../services/ai.service';
import { emailService } from '../services/email.service';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class RFPController {
  async createFromText(req: Request, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        throw new AppError('Text input is required', 400);
      }

      // Extract RFP using AI
      const extracted = await aiService.extractRFPFromText(text);

      // Create RFP in database
      const rfp = await prisma.rFP.create({
        data: {
          title: extracted.title,
          description: extracted.description,
          requirements: extracted.requirements,
          budget: extracted.budget,
          deadline: extracted.deadline ? new Date(extracted.deadline) : null,
          paymentTerms: extracted.paymentTerms,
          warranty: extracted.warranty,
          deliveryTerms: extracted.deliveryTerms,
          status: 'draft'
        }
      });

      res.status(201).json({
        success: true,
        data: rfp
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, requirements, budget, deadline, paymentTerms, warranty, deliveryTerms } = req.body;

      const rfp = await prisma.rFP.create({
        data: {
          title,
          description,
          requirements: requirements || [],
          budget: budget ? parseFloat(budget) : null,
          deadline: deadline ? new Date(deadline) : null,
          paymentTerms,
          warranty,
          deliveryTerms,
          status: 'draft'
        }
      });

      res.status(201).json({
        success: true,
        data: rfp
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const rfps = await prisma.rFP.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          proposals: {
            include: {
              vendor: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: rfps
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const rfp = await prisma.rFP.findUnique({
        where: { id },
        include: {
          proposals: {
            include: {
              vendor: true
            }
          },
          emails: {
            where: { direction: 'outbound' },
            include: {
              vendor: true
            }
          }
        }
      });

      if (!rfp) {
        throw new AppError('RFP not found', 404);
      }

      res.json({
        success: true,
        data: rfp
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, description, requirements, budget, deadline, paymentTerms, warranty, deliveryTerms, status } = req.body;

      const rfp = await prisma.rFP.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(requirements && { requirements }),
          ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
          ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
          ...(paymentTerms !== undefined && { paymentTerms }),
          ...(warranty !== undefined && { warranty }),
          ...(deliveryTerms !== undefined && { deliveryTerms }),
          ...(status && { status })
        }
      });

      res.json({
        success: true,
        data: rfp
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.rFP.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'RFP deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async sendToVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { vendorIds } = req.body;

      if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
        throw new AppError('vendorIds array is required', 400);
      }

      // Get RFP
      const rfp = await prisma.rFP.findUnique({
        where: { id }
      });

      if (!rfp) {
        throw new AppError('RFP not found', 404);
      }

      // Get vendors
      const vendors = await prisma.vendor.findMany({
        where: { id: { in: vendorIds } }
      });

      if (vendors.length !== vendorIds.length) {
        throw new AppError('Some vendors not found', 404);
      }

      // Send emails
      const emailResults = [];
      for (const vendor of vendors) {
        try {
          const messageId = await emailService.sendRFPEmail(vendor.email, vendor.name, {
            title: rfp.title,
            description: rfp.description || undefined,
            requirements: rfp.requirements as any,
            budget: rfp.budget || undefined,
            deadline: rfp.deadline?.toISOString(),
            paymentTerms: rfp.paymentTerms || undefined,
            warranty: rfp.warranty || undefined,
            deliveryTerms: rfp.deliveryTerms || undefined
          });

          // Save email record
          const email = await prisma.email.create({
            data: {
              messageId,
              from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
              to: vendor.email,
              subject: `RFP: ${rfp.title}`,
              body: `RFP sent to ${vendor.name}`,
              direction: 'outbound',
              status: 'processed',
              rfpId: rfp.id,
              vendorId: vendor.id
            }
          });

          emailResults.push({ vendorId: vendor.id, vendorName: vendor.name, success: true, emailId: email.id });
        } catch (error) {
          logger.error(`Error sending email to ${vendor.email}:`, error);
          emailResults.push({ vendorId: vendor.id, vendorName: vendor.name, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      // Update RFP status
      await prisma.rFP.update({
        where: { id },
        data: { status: 'sent' }
      });

      res.json({
        success: true,
        data: {
          rfpId: id,
          results: emailResults
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async compareProposals(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Get RFP with proposals
      const rfp = await prisma.rFP.findUnique({
        where: { id },
        include: {
          proposals: {
            include: {
              vendor: true
            },
            where: {
              status: { in: ['parsed', 'evaluated'] }
            }
          }
        }
      });

      if (!rfp) {
        throw new AppError('RFP not found', 404);
      }

      if (rfp.proposals.length === 0) {
        throw new AppError('No proposals found for this RFP', 404);
      }

      // Prepare data for AI comparison
      const proposalsData = rfp.proposals.map(p => ({
        vendorId: p.vendorId,
        vendorName: p.vendor.name,
        proposalData: p.extractedData as any
      }));

      // Get AI comparison
      const comparison = await aiService.compareProposals(
        rfp.requirements,
        proposalsData
      );

      // Update proposal scores
      for (const proposalResult of comparison.proposals) {
        await prisma.proposal.updateMany({
          where: {
            rfpId: id,
            vendorId: proposalResult.vendorId
          },
          data: {
            aiScore: proposalResult.score,
            aiSummary: proposalResult.summary,
            status: 'evaluated'
          }
        });
      }

      res.json({
        success: true,
        data: {
          rfp: {
            id: rfp.id,
            title: rfp.title,
            requirements: rfp.requirements
          },
          comparison
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

