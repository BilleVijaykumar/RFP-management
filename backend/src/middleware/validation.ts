import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler';

const createRFPFromTextSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters')
});

const createRFPSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  requirements: z.any().optional(),
  budget: z.number().optional(),
  deadline: z.string().optional(),
  paymentTerms: z.string().optional(),
  warranty: z.string().optional(),
  deliveryTerms: z.string().optional()
});

const createVendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional()
});

const updateVendorSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  category: z.string().optional(),
  rating: z.number().optional(),
  notes: z.string().optional()
});

export const validateCreateFromText = (req: Request, res: Response, next: NextFunction) => {
  try {
    createRFPFromTextSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const validateCreateRFP = (req: Request, res: Response, next: NextFunction) => {
  try {
    createRFPSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const validateCreateVendor = (req: Request, res: Response, next: NextFunction) => {
  try {
    createVendorSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

export const validateUpdateVendor = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateVendorSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError(error.errors[0].message, 400));
    } else {
      next(error);
    }
  }
};

