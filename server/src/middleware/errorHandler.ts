import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Error]', err);

  // Zod Validation Error
  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    res.status(400).json({
      success: false,
      message: `Validation error: ${issues}`,
      errors: err.issues,
    });
    return;
  }

  // Mongo Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'record';
    if (field === 'consultantId' || err.message?.includes('consultantId_1_date_1_startTime_1')) {
      res.status(409).json({
        success: false,
        message: 'This slot was just selected by someone else. Please choose another time.',
      });
      return;
    }
    res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
    return;
  }

  // CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource identifier provided.',
    });
    return;
  }

  // General server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong while processing your request. Please try again.',
  });
};
