/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/api/auto-login',
        permanent: false,
      },
    ]
  },
}
module.exports = nextConfig
