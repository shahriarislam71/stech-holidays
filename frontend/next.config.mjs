/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to allow dynamic routes for cPanel hosting
  images: {
    dangerouslyAllowSVG: true, // Allow SVGs if needed
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.firsttrip.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firsttrip.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
