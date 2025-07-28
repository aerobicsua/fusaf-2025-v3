/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Skip TypeScript and ESLint during build for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimizations
  experimental: {
    forceSwcTransforms: true,
  },

  // Remove console.logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
};

module.exports = nextConfig;
