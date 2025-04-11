import mongoose from 'mongoose';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import SubOrder from '../models/suborder.model.js';
import CustomErrorHandler from '../utils/customErrorHandler.js';

export const placeOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customerId = req.user._id;
    const items = req.body.items; // [{ productId, quantity }]

    // 1. Group items by vendor and validate stock
    const vendorMap = new Map(); // vendorId -> array of items
    const updatedProducts = [];

    for (let item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) return next(CustomErrorHandler.notFound("Product not found"));

      if (product.stock < item.quantity) {
        return next(CustomErrorHandler.badRequest(`Insufficient stock for ${product.name}`));
      }

      product.stock -= item.quantity;
      updatedProducts.push(product);

      const vendorId = product.vendorId.toString();
      if (!vendorMap.has(vendorId)) {
        vendorMap.set(vendorId, []);
      }

      vendorMap.get(vendorId).push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 2. Save updated product stock
    for (let product of updatedProducts) {
      await product.save({ session });
    }

    // 3. Create suborders per vendor
    const subOrderIds = [];
    let totalAmount = 0;

    for (let [vendorId, vendorItems] of vendorMap.entries()) {
      const subTotal = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      totalAmount += subTotal;
    
      const subOrder = await SubOrder.create([{
        customerId: customerId,
        vendorId: vendorId,
        items: vendorItems.map(item => ({
          productId: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
        total: subTotal,
      }], { session });
      
      subOrderIds.push(subOrder[0]._id);
    }

    // 4. Create master order

    const masterOrder = await Order.create([{
        customerId: customerId,
        subOrders: subOrderIds,
        totalAmount,
        status: 'pending'
      }], { session });
      
    await SubOrder.updateMany(
        { _id: { $in: subOrderIds } },
        { $set: { masterOrderId: masterOrder[0]._id } },
        { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Order placed successfully",
      order: masterOrder[0]
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
