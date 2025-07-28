/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optimizations for production
  experimental: {
    forceSwcTransforms: true,
  },

  // Ignore build errors for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables
  env: {
    CUSTOM_KEY: 'FUSAF_UKRAINE',
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    domains: [
      'fusaf.org.ua',
      'supabase.co',
      'googleusercontent.com',
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
