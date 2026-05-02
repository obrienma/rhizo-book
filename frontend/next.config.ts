import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
