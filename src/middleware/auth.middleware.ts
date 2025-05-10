import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../config/jwt';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const isUsuario = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'usuario') {
    res.status(403).json({ message: 'Access forbidden: User role required' });
    return;
  }
  
  next();
};

export const isPsicologo = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'psicologo') {
    res.status(403).json({ message: 'Access forbidden: Psychologist role required' });
    return;
  }
  
  next();
}; 