import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import { asyncHandler } from './error.middleware.js';

const { User } = db;

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      statusCode: 401,
      message: 'No token provided'
    });
  }

  const token = authHeader.substring(7);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        statusCode: 401,
        message: 'Token has expired'
      });
    }
    return res.status(401).json({
      statusCode: 401,
      message: 'Invalid token'
    });
  }

  const user = await User.scope('withPassword').findByPk(decoded.userId);

  if (!user) {
    return res.status(401).json({
      statusCode: 401,
      message: 'User not found'
    });
  }

  user.password = undefined;
  req.user = user;
  next();
});

const checkRole = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        statusCode: 403,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`
      });
    }

    next();
  });
};

export const requireAdmin = checkRole('ADMIN');
export const requireStaffOrAdmin = checkRole('ADMIN', 'STAFF');
