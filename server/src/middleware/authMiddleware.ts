import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { User } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Verify user exists
    const user = await User.findById(decoded.userId).select('role email consultantId');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.',
      });
      return;
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      consultantId: user.consultantId ? user.consultantId.toString() : undefined,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
};

export const requireRole = (role: 'ADMIN' | 'USER' | 'CONSULTANT') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (req.user.role !== role && req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.',
      });
      return;
    }

    next();
  };
};

export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('role email consultantId');
    if (user) {
      req.user = {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        consultantId: user.consultantId ? user.consultantId.toString() : undefined,
      };
    }
    next();
  } catch (error) {
    // If token is invalid or expired, continue as guest
    next();
  }
};
