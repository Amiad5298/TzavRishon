/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  
  // Disable image optimization for simpler deployment
  images: {
    unoptimized: true,
  },
  
  // Configure API proxy to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:8080/api/:path*',
      },
    ];
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
  },
  
  // Empty turbopack config to silence warning
  turbopack: {},
};

export default nextConfig;

