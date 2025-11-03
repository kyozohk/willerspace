import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, SESSION_SECRET_VALUE } from './constants';

export async function createSession() {
  cookies().set(SESSION_COOKIE_NAME, SESSION_SECRET_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
    sameSite: 'lax',
  });
}

export async function getSession() {
  const session = cookies().get(SESSION_COOKIE_NAME);
  if (!session || session.value !== SESSION_SECRET_VALUE) {
    return null;
  }
  return { isAuthed: true };
}

export async function deleteSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}
