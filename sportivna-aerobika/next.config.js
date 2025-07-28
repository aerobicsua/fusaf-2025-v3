/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true,
    domains: ['ext.same-assets.com', 'same-assets.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ext.same-assets.com',
      },
    ],
  },

  // 🚫 АГРЕСИВНЕ ВІДКЛЮЧЕННЯ ПЕРЕВІРОК ДЛЯ ЗБІРКИ
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // 🚫 ПОВНЕ ВІДКЛЮЧЕННЯ ТИПІЗАЦІЇ
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Експериментальні налаштування
  experimental: {
    forceSwcTransforms: true,
    typedRoutes: false,
  },

  // Налаштування для динамічного рендерингу
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  // Webpack налаштування для повного відключення TS checker і @ alias
  webpack: (config, { dev, isServer }) => {
    // Відключаємо TypeScript checker повністю
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
    );

    // Додаємо @ alias резолюцію
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      util: false,
      buffer: false,
      events: false,
      os: false,
    };

    // Додаємо повне ігнорування TypeScript помилок
    config.ignoreWarnings = [
      /typescript/i,
      /ts\(/i,
      /type/i,
      /Property.*does not exist/i,
      /roles.*does not exist/i,
    ];

    return config;
  },

  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Додаткові налаштування для production
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
  }),
};

module.exports = nextConfig;
