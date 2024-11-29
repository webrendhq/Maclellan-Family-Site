/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  images: {
    domains: ['maclellanfamily.com.s3.amazonaws.com', 's3.amazonaws.com'],
    remotePatterns: [{
      protocol: 'https',
      hostname: '**.amazonaws.com',
      pathname: '/**',
    }],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false, 
      crypto: false,
      path: false,
      stream: false,
      'aws-crt': false
    };
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3']
  }
 };
 
 module.exports = config;