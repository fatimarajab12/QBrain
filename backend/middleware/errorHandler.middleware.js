import { AppError } from '../utils/AppError.js';
import mongoose from 'mongoose';

/**
 * Global Error Handler Middleware
 * Handles all errors in a unified way
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.userId || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError' || (err.message && err.message.includes('ObjectId'))) {
    const message = 'Invalid ID format';
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const keyPattern = err.keyPattern || {};
    const keyValue = err.keyValue || {};
    
    // Handle feature name duplicate
    if (keyPattern.projectId && keyPattern.name) {
      const message = `A feature with the name "${keyValue.name}" already exists in this project. Please use a different name or update the existing feature.`;
      error = new AppError(message, 409);
    }
    // Handle other duplicates
    else {
      const field = Object.keys(keyPattern)[0] || 'field';
      const value = keyValue[field] || 'value';
      const message = `${field} "${value}" already exists`;
      error = new AppError(message, 409);
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    const message = 'Validation Error';
    error = new AppError(message, 400);
    error.errors = errors;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token has expired. Please login again.';
    error = new AppError(message, 401);
  }

  // Send error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const response = {
    success: false,
    message
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = err.message;
    response.stack = err.stack;
    if (error.errors) {
      response.errors = error.errors;
    }
  }

  // Add validation errors if present
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  res.status(statusCode).json(response);
};

