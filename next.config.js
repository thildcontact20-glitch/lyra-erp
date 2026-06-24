/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { serverComponentsExternalPackages: ['bcryptjs', 'prisma', '@prisma/client'] },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  skipTrailingSlashRedirect: true,
}
module.exports = nextConfig
