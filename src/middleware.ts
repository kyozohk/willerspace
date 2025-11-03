import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, SESSION_SECRET_VALUE } from './lib/constants';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie || sessionCookie.value !== SESSION_SECRET_VALUE) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/post/:path*'],
};
