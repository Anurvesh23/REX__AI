// middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// List your protected routes here
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/settings(.*)',
]);

// 1. Make sure the callback function is `async`
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // 2. Make sure you `await` the auth().protect() call
    await auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};