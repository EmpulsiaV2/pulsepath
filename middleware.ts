export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/timeline/:path*',
    '/stats/:path*',
    '/settings/:path*',
  ],
};
