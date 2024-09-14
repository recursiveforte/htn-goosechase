import { PrismaClient } from '@prisma/client'

// Docs about instantiating `PrismaClient` with Next.js:
// https://pris.ly/d/help/next-js-best-practices

declare const globalThis: {
  prismaGlobal: PrismaClient
} & typeof global

const prisma = globalThis.prismaGlobal ?? new PrismaClient()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma