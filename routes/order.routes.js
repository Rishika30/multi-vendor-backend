import { Router } from 'express';
import { placeOrder } from '../controllers/order.controller.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { authenticate } from '../middleware/authenticate.js';

const orderRouter = Router();

orderRouter.post('/', authenticate, authorizeRoles('customer'), placeOrder);

export default orderRouter;
