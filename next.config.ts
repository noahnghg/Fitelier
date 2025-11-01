import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  reactStrictMode: true,
  
  /* Optimize images from Supabase */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  /* Enable experimental features for better performance */
  experimental: {
    // Optimize server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  /* Optimize bundle size */
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
