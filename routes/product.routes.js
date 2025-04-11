import { Router } from 'express';
import { createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { validateRequest, productSchema } from '../middleware/validator.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { authenticate } from '../middleware/authenticate.js';
const productRouter = Router();

productRouter.post('/', authenticate, authorizeRoles('vendor'), validateRequest(productSchema), createProduct);
productRouter.patch('/:id', authenticate, authorizeRoles('vendor'), updateProduct);
productRouter.delete('/:id', authenticate, authorizeRoles('vendor'), deleteProduct);

export default productRouter;