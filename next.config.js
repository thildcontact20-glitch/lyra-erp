/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { serverComponentsExternalPackages: ['bcryptjs'] },
  skipTrailingSlashRedirect: true,
}
module.exports = nextConfig
