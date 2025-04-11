import express from 'express';
import { config } from './helpers/env.js';
import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';
import orderRouter from './routes/order.routes.js';
import databaseConnection from './helpers/db.js';
import errorHandler from './middleware/errorHandler.js';
import analyticsRouter from './routes/analytics.routes.js';
import devAdminRouter from './routes/dev-admin.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/analytics', analyticsRouter);
app.use('/admin', devAdminRouter);
app.use(errorHandler);

app.get('/', (req,res) => {
    res.send("Welcome to the Multi-Vendor Order Management API");
});

app.listen(config.PORT, async () => {
    console.log(`Multi-Vendor Order Management API is running on http://localhost:${config.PORT}`);
    await databaseConnection();
})

export default app;
