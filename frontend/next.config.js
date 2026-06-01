/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-big-calendar'],
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3001';
    return [
      {
        source: '/v1/:path*',
        destination: `${backendUrl}/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
