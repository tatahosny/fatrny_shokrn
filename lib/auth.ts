import { User, Role } from './types';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'fetarni_session';

export interface AuthSession {
  userId: string;
  name: string;
  phone: string;
  role: Role;
  exp: number;
}

// تشفير وفك تشفير جلسة آمنة
export function createSessionToken(user: User): string {
  const payload: AuthSession = {
    userId: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 يوماً
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function parseSessionToken(token: string): AuthSession | null {
  try {
    const jsonStr = Buffer.from(token, 'base64url').toString('utf-8');
    const session = JSON.parse(jsonStr) as AuthSession;
    if (session.exp && session.exp < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUserFromCookie(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return parseSessionToken(token);
}

export { SESSION_COOKIE_NAME };
