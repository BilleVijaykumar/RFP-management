import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';

const router = Router();
const emailController = new EmailController();

// Get all emails
router.get('/', emailController.getAll);

// Get email by ID
router.get('/:id', emailController.getById);

// Test email connection
router.post('/test', emailController.testConnection);

export default router;

