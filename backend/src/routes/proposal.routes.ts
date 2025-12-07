import { Router } from 'express';
import { ProposalController } from '../controllers/proposal.controller';

const router = Router();
const proposalController = new ProposalController();

// Get all proposals
router.get('/', proposalController.getAll);

// Get proposal by ID
router.get('/:id', proposalController.getById);

// Get proposals for RFP
router.get('/rfp/:rfpId', proposalController.getByRFP);

// Manually trigger proposal parsing
router.post('/:id/parse', proposalController.parse);

export default router;

