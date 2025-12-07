import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { aiService } from '../services/ai.service';
import { AppError } from '../middleware/errorHandler';

export class ProposalController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const proposals = await prisma.proposal.findMany({
        include: {
          rfp: true,
          vendor: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: proposals
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          rfp: true,
          vendor: true
        }
      });

      if (!proposal) {
        throw new AppError('Proposal not found', 404);
      }

      res.json({
        success: true,
        data: proposal
      });
    } catch (error) {
      next(error);
    }
  }

  async getByRFP(req: Request, res: Response, next: NextFunction) {
    try {
      const { rfpId } = req.params;

      const proposals = await prisma.proposal.findMany({
        where: { rfpId },
        include: {
          vendor: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: proposals
      });
    } catch (error) {
      next(error);
    }
  }

  async parse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          rfp: true,
          vendor: true
        }
      });

      if (!proposal) {
        throw new AppError('Proposal not found', 404);
      }

      if (!proposal.rawContent) {
        throw new AppError('No raw content to parse', 400);
      }

      // Parse with AI
      const extractedData = await aiService.parseProposal(
        proposal.rawContent,
        proposal.attachmentsUrls as string[] || [],
        proposal.rfp.requirements
      );

      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore(extractedData, proposal.rfp.requirements);

      // Update proposal
      const updated = await prisma.proposal.update({
        where: { id },
        data: {
          extractedData,
          complianceScore,
          status: 'parsed',
          parsedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  private calculateComplianceScore(proposalData: any, rfpRequirements: any): number {
    let score = 0;
    let factors = 0;

    if (proposalData.pricing?.total || proposalData.pricing?.items?.length > 0) {
      score += 30;
    }
    factors++;

    if (proposalData.terms) {
      if (proposalData.terms.payment) score += 15;
      if (proposalData.terms.warranty) score += 15;
      if (proposalData.terms.delivery) score += 15;
      factors += 3;
    }

    if (proposalData.compliance?.meetsRequirements) {
      score += 25;
    }
    factors++;

    return Math.round((score / (factors * 25)) * 100);
  }
}

