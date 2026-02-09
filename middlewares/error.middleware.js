/**
 * Global Error Handler Middleware
 * Returns error responses in format: { statusCode, message }
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = err.details[0].message;
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Don't expose internal errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    statusCode,
    message
  });
};

/**
 * Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};

/**
 * Async Error Wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { errorHandler, notFoundHandler, asyncHandler };
