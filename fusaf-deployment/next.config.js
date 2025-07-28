/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    forceSwcTransforms: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    SKIP_TYPE_CHECK: 'true',
    DISABLE_TYPE_CHECK: 'true',
  },
  compiler: {
    removeConsole: false,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      config.plugins = config.plugins.filter(
        plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );
    }
    return config;
  },
  // Розкоментуйте наступні рядки для статичного експорту
  // output: 'export',
  // distDir: 'dist',
  // trailingSlash: true,
  // images: { unoptimized: true }
};

module.exports = nextConfig;
