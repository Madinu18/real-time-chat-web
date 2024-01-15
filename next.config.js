/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/ruangan/:slug*",
        destination: "/app/ruangan/:slug*",
      },
    ];
  },
};

module.exports = nextConfig;
