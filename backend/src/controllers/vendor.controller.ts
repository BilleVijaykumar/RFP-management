import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export class VendorController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const vendors = await prisma.vendor.findMany({
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: vendors
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const vendor = await prisma.vendor.findUnique({
        where: { id },
        include: {
          proposals: {
            include: {
              rfp: true
            }
          }
        }
      });

      if (!vendor) {
        throw new AppError('Vendor not found', 404);
      }

      res.json({
        success: true,
        data: vendor
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, contactPerson, phone, category, notes } = req.body;

      const vendor = await prisma.vendor.create({
        data: {
          name,
          email,
          contactPerson,
          phone,
          category,
          notes
        }
      });

      res.status(201).json({
        success: true,
        data: vendor
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email, contactPerson, phone, category, rating, notes } = req.body;

      const vendor = await prisma.vendor.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(contactPerson !== undefined && { contactPerson }),
          ...(phone !== undefined && { phone }),
          ...(category !== undefined && { category }),
          ...(rating !== undefined && { rating: parseFloat(rating) }),
          ...(notes !== undefined && { notes })
        }
      });

      res.json({
        success: true,
        data: vendor
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.vendor.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Vendor deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

