import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow access to login page and home page
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  // For protected routes, check if user is authenticated
  // This is basic check - in production, verify JWT token
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
    '/patient/:path*',
  ],
};

