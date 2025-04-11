import { Router } from 'express';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../helpers/env.js';
import CustomErrorHandler from '../utils/customErrorHandler.js';

const devAdminRouter = Router();

devAdminRouter.post('/', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Prevent duplicate admins
    const existing = await User.findOne({ email });
    if (existing) {
        return next(CustomErrorHandler.alreadyExist('Admin already exists'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    res.status(201).json({
        message: 'Admin created successfully',
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        },
      });
  } catch (err) {
    next(err);
  }
});

export default devAdminRouter;
