import Product from '../models/product.model.js';
import CustomErrorHandler from '../utils/customErrorHandler.js';

export const createProduct = async (req, res, next) => {
    try {
        const { name, price, stock, category } = req.body;
        const vendorId = req.user._id;
        const product = await Product.create({
            name,
            price,
            stock,
            category,
            vendorId,
        });

        res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const vendorId = req.user._id;

        const product = await Product.findOneAndUpdate({ _id: productId, vendorId }, req.body, { new: true });
        if (!product) {
            return next(CustomErrorHandler.notFound('Product not found'));
        }

        res.status(200).json({ message: 'Product updated', product });
    } catch (error) {
        next(error);
    }
  
};

export const deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const vendorId = req.user._id;

        const deleted = await Product.findOneAndDelete({ _id: productId, vendorId });

        if (!deleted) {
            return next(CustomErrorHandler.notFound('Product not found'));
        }

        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
       next(error); 
    }
};
