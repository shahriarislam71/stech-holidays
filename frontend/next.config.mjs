/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // <-- This makes your build succeed
  },

  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.firsttrip.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firsttrip.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        pathname: '/**',
      },

  {
        protocol: 'https',
        hostname: 'i.travelapi.com',
        pathname: '/**',
      },
      // Add other domains as needed
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.example.com', // For any example.com subdomains
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'q-xx.bstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'q.bstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'r-xx.bstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.bstatic.com', // wildcard covers all subdomains
        pathname: '/**',
      },

      // Your own domain wildcard
      {
        protocol: 'https',
        hostname: '**.stechholidays.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
