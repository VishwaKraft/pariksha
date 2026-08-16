/** @type {import('next').NextConfig} */
console.log("Client Environment Variables at Startup:", process.env);
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: [
      'png.pngtree.com',
      'validata-software.com',
      'images.unsplash.com',
    ],
  },
  transpilePackages: ['@material-table/core'],
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mui/icons-material/DeleteOutline': '@mui/icons-material/DeleteOutlined',
    };
    return config;
  },
};

module.exports = nextConfig;
