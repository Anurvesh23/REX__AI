// middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const session = await auth();
    // Different Clerk SDK versions return different shapes from auth().
    // Common properties we can check at runtime are: isAuthenticated, userId,
    // and status. Fall back to a conservative check using any casts.
    const maybeIsAuthenticated = (session && (
      // modern SDKs sometimes expose isAuthenticated
      (session as any).isAuthenticated === true ||
      // some versions expose userId when signed in
      Boolean((session as any).userId) ||
      // older/alternate shapes may expose status === 'active'
      (session as any).status === 'active'
    ));

    const isSignedIn = !!maybeIsAuthenticated;

    if (!isSignedIn) {
      // Use NextResponse.redirect so Next.js handles the redirect properly.
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "\/(api|trpc)(.*)"],
};