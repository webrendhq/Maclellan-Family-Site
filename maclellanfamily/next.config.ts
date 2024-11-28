/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/MaclellanFamily.com' : '',
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: [],
  },
  distDir: 'dist',
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig