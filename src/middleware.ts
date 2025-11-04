import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const pathname = request.nextUrl.pathname;
  
  // Check if the route is for creating or editing content
  if (pathname.includes('/create/') || pathname.includes('/edit/')) {
    // For these routes, we'll check authentication client-side
    // The client-side components will handle redirects if needed
    return NextResponse.next();
  }
  
  // For other protected routes, proceed normally
  return NextResponse.next();
}

export const config = {
  // Match routes that might need authentication
  matcher: [
    '/:handle/create/:path*',
    '/:handle/edit/:path*',
    '/settings/:path*'
  ],
};
