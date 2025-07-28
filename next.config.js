/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: [
      'localhost',
      'fusaf.org.ua',
      'cdn.fusaf.org.ua',
      'same-assets.com',
      'images.unsplash.com'
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          }
        ]
      }
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/users',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/profile',
        permanent: false,
      }
    ]
  },

  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health'
      }
    ]
  },

  // Environment variables available to the browser
  env: {
    SITE_NAME: process.env.SITE_NAME || 'ФУСАФ',
    SITE_URL: process.env.NEXTAUTH_URL || 'https://fusaf.org.ua',
    API_URL: process.env.API_URL || 'https://fusaf.org.ua/api',
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      }
    }

    // Bundle analyzer (development only)
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('@next/bundle-analyzer')({
        enabled: process.env.ANALYZE === 'true',
      })
      config.plugins.push(new BundleAnalyzerPlugin())
    }

    return config
  },

  // Experimental features for performance
  experimental: {
    // Enable SWC transforms
    swcTraceProfiling: process.env.NODE_ENV === 'development',
  },

  // Output configuration for production
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true
  },

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,

  // Generate ETags for caching
  generateEtags: true,

  // Disable x-powered-by header
  httpAgentOptions: {
    keepAlive: true,
  },

  // TypeScript configuration
  typescript: {
    // Ignore TypeScript errors during build (handle separately)
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Ignore ESLint errors during build (handle separately)
    ignoreDuringBuilds: false,
  },

  // Trailing slash configuration
  trailingSlash: false,

  // Page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // API routes configuration removed for Next.js 14 compatibility

  // Server runtime configuration
  serverRuntimeConfig: {
    // Only available on the server side
    mySecret: process.env.MY_SECRET,
  },

  // Public runtime configuration
  publicRuntimeConfig: {
    // Available on both server and client side
    staticFolder: '/static',
  },
}

module.exports = nextConfig
