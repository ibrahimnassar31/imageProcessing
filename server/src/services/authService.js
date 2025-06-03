import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });
    logger.info(`Token generated for userId: ${payload.userId}`);
    return token;
  } catch (error) {
    logger.error(`Failed to generate token: ${error.message}`);
    throw new Error('Token generation failed');
  }
};

export { generateToken };