import { Router } from 'express';
import { RFPController } from '../controllers/rfp.controller';
import { validateCreateRFP, validateCreateFromText } from '../middleware/validation';

const router = Router();
const rfpController = new RFPController();

// Create RFP from natural language
router.post('/create-from-text', validateCreateFromText, rfpController.createFromText);

// Create RFP manually
router.post('/', validateCreateRFP, rfpController.create);

// Get all RFPs
router.get('/', rfpController.getAll);

// Get RFP by ID
router.get('/:id', rfpController.getById);

// Update RFP
router.put('/:id', rfpController.update);

// Delete RFP
router.delete('/:id', rfpController.delete);

// Send RFP to vendors
router.post('/:id/send', rfpController.sendToVendors);

// Get comparison for RFP
router.get('/:id/compare', rfpController.compareProposals);

export default router;

