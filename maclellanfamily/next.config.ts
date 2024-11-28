// next.config.ts
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: [],
  },
  distDir: 'dist',
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;