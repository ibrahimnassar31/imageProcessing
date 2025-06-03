import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${err.stack}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorHandler;