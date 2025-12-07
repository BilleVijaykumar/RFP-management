import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';
import { validateCreateVendor, validateUpdateVendor } from '../middleware/validation';

const router = Router();
const vendorController = new VendorController();

// Get all vendors
router.get('/', vendorController.getAll);

// Get vendor by ID
router.get('/:id', vendorController.getById);

// Create vendor
router.post('/', validateCreateVendor, vendorController.create);

// Update vendor
router.put('/:id', validateUpdateVendor, vendorController.update);

// Delete vendor
router.delete('/:id', vendorController.delete);

export default router;

