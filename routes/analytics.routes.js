import { Router } from 'express';
import { getRevenuePerVendor, getTopProducts, getAverageOrderValue, getDailySales, getLowStockItems} from '../controllers/analytics.controller.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { authenticate } from '../middleware/authenticate.js';
const analyticsRouter = Router();

analyticsRouter.get('/revenue', authenticate, authorizeRoles('admin'), getRevenuePerVendor);
analyticsRouter.get('/top-products', authenticate, authorizeRoles('admin'), getTopProducts);
analyticsRouter.get('/avg-order-value', authenticate, authorizeRoles('admin'), getAverageOrderValue);
analyticsRouter.get('/daily-sales', authenticate, authorizeRoles('vendor'), getDailySales);
analyticsRouter.get('/low-stock', authenticate, authorizeRoles('vendor'), getLowStockItems);

export default analyticsRouter;