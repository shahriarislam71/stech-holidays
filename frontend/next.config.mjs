/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to allow dynamic routes for cPanel hosting
  images: {
    dangerouslyAllowSVG: true, // Allow SVGs
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',  // Allows any HTTPS host
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
