/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ← ADD THIS LINE
  eslint: {
    ignoreDuringBuilds: true,
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
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.example.com',
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
        hostname: '**.bstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.stechholidays.com',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // ← ADD THIS TOO (optional)
  },
};

export default nextConfig;