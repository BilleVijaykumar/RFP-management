import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { emailService } from '../services/email.service';
import { AppError } from '../middleware/errorHandler';

export class EmailController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { direction, rfpId, vendorId } = req.query;

      const where: any = {};
      if (direction) where.direction = direction;
      if (rfpId) where.rfpId = rfpId;
      if (vendorId) where.vendorId = vendorId;

      const emails = await prisma.email.findMany({
        where,
        include: {
          rfp: true,
          vendor: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: emails
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const email = await prisma.email.findUnique({
        where: { id },
        include: {
          rfp: true,
          vendor: true
        }
      });

      if (!email) {
        throw new AppError('Email not found', 404);
      }

      res.json({
        success: true,
        data: email
      });
    } catch (error) {
      next(error);
    }
  }

  async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const isConnected = await emailService.testConnection();

      res.json({
        success: isConnected,
        message: isConnected ? 'Email connection successful' : 'Email connection failed'
      });
    } catch (error) {
      next(error);
    }
  }
}

