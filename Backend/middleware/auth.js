import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';
import { env } from '../config/env.js';
import { HttpError } from './error.js';

export const COOKIE = 'token';

const isProd = Boolean(env.isProd);

export const cookieOptions = {
  httpOnly: false,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

export function signToken(user) {
  return jwt.sign({ sub: String(user._id ?? user.id), role: user.role }, env.jwtSecret, { expiresIn: '7d' });
}

export function setAuthCookie(res, user) {
  const token = signToken(user);
  const cookieConfig = { ...cookieOptions, maxAge: 7 * 24 * 3600 * 1000 };
  console.log('setting cookie', { isProd, secure: cookieConfig.secure, sameSite: cookieConfig.sameSite, httpOnly: cookieConfig.httpOnly });
  res.cookie(COOKIE, token, cookieConfig);
  res.cookie('accessToken', token, cookieConfig);
}

export async function requireAuth(req, res, next) {
  const header = req.get('authorization');
  const token = req.cookies?.[COOKIE] || req.cookies?.accessToken || (header?.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) throw new HttpError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.sub).lean();
  if (!user) throw new HttpError(401, 'User no longer exists');

  req.user = { id: String(user._id), role: user.role, email: user.email, name: user.name ?? user.username };
  next();
}

export const verifyUser = requireAuth;
export const tokenGenrator = signToken;
export const setCookies = setAuthCookie;
export const requireAuthLegacy = requireAuth;
