import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 可以公开访问的路由
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/gallery(.*)',
  '/pricing(.*)',
  '/privacy-policy(.*)',
  '/terms-of-service(.*)',
  '/api/generate-cat',
  '/api/generate-quiz',
  '/api/points',
  '/api/images(.*)', // 允许未注册用户访问图库API
  '/api/webhooks/clerk',
  '/api/webhooks/creem'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};