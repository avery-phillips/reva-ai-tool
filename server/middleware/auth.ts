import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Security: JWT token validation middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

const JWT_SECRET = process.env.SESSION_SECRET || 'fallback-secret-key';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = decoded as { id: number; username: string };
    next();
  });
};

// Security: Hash password utility
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // Higher salt rounds for better security
  return await bcrypt.hash(password, saltRounds);
};

// Security: Verify password utility
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Security: Generate JWT token
export const generateToken = (user: { id: number; username: string }): string => {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Security: Password validation schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Security: Username validation schema
export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username must be no more than 30 characters long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');