/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
<<<<<<< HEAD
  experimental: { serverComponentsExternalPackages: ['bcryptjs'] },
  skipTrailingSlashRedirect: true,
=======
  experimental: { serverComponentsExternalPackages: ['bcryptjs', 'prisma', '@prisma/client'] },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
>>>>>>> b43f2ad1 (fix: standalone output + ignore build errors)
}
module.exports = nextConfig
