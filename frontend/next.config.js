/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  experimental: {
    proxyTimeout: 120000,
  },
};

module.exports = nextConfig;
