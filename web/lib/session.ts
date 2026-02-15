import jwt, { JwtPayload } from 'jsonwebtoken';

export interface SessionClaims extends JwtPayload {
  userId: string;
  rank?: string;
  tokenType?: 'session' | 'relay';
  aud?: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

export function signSessionToken(userId: string, rank?: string): string {
  return jwt.sign(
    { userId, rank, tokenType: 'session' },
    getJwtSecret(),
    { expiresIn: '1d' }
  );
}

export function signRelayToken(userId: string): string {
  return jwt.sign(
    { userId, tokenType: 'relay', aud: 'relay' },
    getJwtSecret(),
    { expiresIn: '5m' }
  );
}

export function verifySessionLikeToken(token: string): SessionClaims | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded !== 'object' || decoded === null) {
      return null;
    }

    if (!('userId' in decoded) || typeof decoded.userId !== 'string') {
      return null;
    }

    return decoded as SessionClaims;
  } catch {
    return null;
  }
}
