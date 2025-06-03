import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';

const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    logger.warn('No token provided in request');
    const error = new Error('No token provided');
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      logger.warn(`User not found for token: ${token}`);
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Invalid token: ${error.message}`);
    const err = new Error('Invalid token');
    err.statusCode = 401;
    throw err;
  }
});

export default authMiddleware;