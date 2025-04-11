import Order from '../models/order.model.js';
import SubOrder from '../models/suborder.model.js';
import Product from '../models/product.model.js';
import mongoose from 'mongoose';

export const getRevenuePerVendor = async (req, res, next) => {
  try {
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    const revenue = await SubOrder.aggregate([
      { $match: { createdAt: { $gte: date30DaysAgo } } },
      {
        $group: {
          _id: "$vendorId",
          totalRevenue: { $sum: "$total" },
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "vendor"
        }
      },
      { $unwind: "$vendor" },
      {
        $project: {
          vendorId: "$_id",
          vendorName: "$vendor.name",
          totalRevenue: 1,
          _id: 0
        }
      }
    ]);

    res.json({ revenue });
  } catch (err) {
    next(err);
  }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const topProducts = await SubOrder.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          totalSold: 1,
          _id: 0
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.json({ topProducts });
  } catch (err) {
    next(err);
  }
};

export const getAverageOrderValue = async (req, res, next) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          avgValue: { $avg: "$totalAmount" }
        }
      },
      { $project: { _id: 0, avgValue: 1 } }
    ]);

    res.json({ averageOrderValue: result[0]?.avgValue || 0 });
  } catch (err) {
    next(err);
  }
};

export const getDailySales = async (req, res, next) => {
    try {
      const vendorId = req.user._id;
      const date7DaysAgo = new Date();
      date7DaysAgo.setDate(date7DaysAgo.getDate() - 7);
  
      const sales = await SubOrder.aggregate([
        { $match: { vendorId, createdAt: { $gte: date7DaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            total: { $sum: "$total" }
          }
        },
        { $sort: { _id: 1 } }
      ]);
  
      res.json({ dailySales: sales });
    } catch (err) {
      next(err);
    }
};
  
export const getLowStockItems = async (req, res, next) => {
    try {
      const vendorId = req.user._id;
      const threshold = 5;
  
      const products = await Product.find({
        vendorId,
        stock: { $lt: threshold }
      }).select("name stock");
  
      res.json({ lowStockItems: products });
    } catch (err) {
      next(err);
    }
};