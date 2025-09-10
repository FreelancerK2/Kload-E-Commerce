// Temporarily disabled Clerk middleware to fix application crash
// import { clerkMiddleware } from '@clerk/nextjs/server';

// export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
