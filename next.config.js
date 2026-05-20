/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15: renamed from experimental.serverComponentsExternalPackages
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

module.exports = nextConfig;
