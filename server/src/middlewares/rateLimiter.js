import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب لكل IP
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  onLimitReached: (req) => {
    logger.warn(`Rate limit reached for IP: ${req.ip}`);
  },
});

export default rateLimiter;