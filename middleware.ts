// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

// Custom middleware to bypass Clerk for public routes
export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const publicRoutes = ['/', '/sign-in', '/sign-up'];
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  // For all other routes, apply Clerk middleware
  return clerkMiddleware()(req, event);
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};