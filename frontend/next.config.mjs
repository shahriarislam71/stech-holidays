/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },
  images: {
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
};

export default nextConfig;
