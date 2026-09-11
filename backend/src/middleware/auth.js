import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

export function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export async function authRequired(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
    if (!token) throw new HttpError(401, 'Please log in to continue.');
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.id).select('-password');
    if (!user || user.frozen) throw new HttpError(401, 'Account is not available.');
    req.user = user;
    next();
  } catch (err) {
    next(err.status ? err : new HttpError(401, 'Invalid or expired session.'));
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
  if (!token) return next();
  jwt.verify(token, env.jwtSecret, async (err, payload) => {
    if (err || !payload) return next();
    const user = await User.findById(payload.id).select('-password');
    if (user && !user.frozen) req.user = user;
    next();
  });
}

export function requireRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, 'Please log in to continue.'));
    if (req.user.role === 'admin') return next();
    if (roles.includes(req.user.role)) return next();
    next(new HttpError(403, 'You do not have permission for this action.'));
  };
}

export const staffRoles = ['admin', 'moderator', 'treasurer'];
