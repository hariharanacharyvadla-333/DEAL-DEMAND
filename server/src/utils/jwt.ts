import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'deal-and-demand-super-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
