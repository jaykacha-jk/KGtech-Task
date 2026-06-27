import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../exceptions/app.errors';
import { MESSAGES } from '../messages/en';

export class AuthService {
  login(username: string, password: string): { token: string } {
    if (username !== env.AUTH_USERNAME || password !== env.AUTH_PASSWORD) {
      throw new UnauthorizedError(MESSAGES.VALIDATION.INVALID_CREDENTIALS);
    }

    const token = jwt.sign({ username }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return { token };
  }

  verifyToken(token: string): { username: string } {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { username: string };
      return { username: decoded.username };
    } catch {
      throw new UnauthorizedError(MESSAGES.ERROR.UNAUTHORIZED);
    }
  }
}

export const authService = new AuthService();
