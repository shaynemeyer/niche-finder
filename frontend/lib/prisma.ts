import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/lib/generated/prisma/client"

// @prisma/adapter-pg does not read the ?schema= parameter from the
// connection string the way the Prisma CLI does — node-postgres ignores it
// and falls back to `public`. Passing it explicitly is what lets the test
// suite point at its own schema.
function schemaFromUrl(connectionString: string | undefined) {
  if (!connectionString) return undefined
  return new URL(connectionString).searchParams.get("schema") ?? undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  const adapter = new PrismaPg(
    { connectionString },
    { schema: schemaFromUrl(connectionString) },
  )
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
