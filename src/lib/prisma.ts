import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createNullPrisma(): PrismaClient {
  // Proxy silencieux pour le build Vercel / environnements sans DB
  const handler: any = {
    get(_target: any, prop: string | symbol) {
      if (prop === '$connect' || prop === '$disconnect') return () => Promise.resolve()
      if (prop === '$transaction') return (fn: any) => Promise.resolve(fn(createNullPrisma()))
      // Toute méthode de modèle (findMany, findUnique, create, etc.) -> array/object vide
      return () => Promise.resolve([])
    },
  }
  return new Proxy({} as PrismaClient, handler)
}

export const prisma = (() => {
  try {
    // Pendant le build Vercel ou CI, on utilise un proxy silencieux
    if (
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.VERCEL === '1'
    ) {
      return createNullPrisma()
    }
    return globalForPrisma.prisma || new PrismaClient()
  } catch {
    return createNullPrisma()
  }
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma as PrismaClient
export default prisma
