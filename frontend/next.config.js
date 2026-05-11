/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://sunbird-backend-gwu5.onrender.com/api/:path*",
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
