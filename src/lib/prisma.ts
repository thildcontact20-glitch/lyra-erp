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
    // Phase build: pas de connexion DB
    return globalForPrisma.prisma || new PrismaClient()
  } catch {
    // Fallback proxy silencieux
    return createNullPrisma()
  }
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma as PrismaClient
export default prisma
