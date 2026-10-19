import { HttpError } from './error.js';

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    console.log('req.user:', req.user);
    if (!req.user || !roles.includes(req.user.role)) throw new HttpError(403, 'Forbidden');
    next();
  };

