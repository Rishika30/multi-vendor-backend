import CustomErrorHandler from '../utils/customErrorHandler.js';

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!allowedRoles.includes(req.user.role)) {
      return next(CustomErrorHandler.authorizeRoles("Access denied: insufficient permissions"));
    }
    next();
  };
};
