// Denne filen hindrer "to many connections" i dev

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};


export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    //log: ["query"], // optional: kan slås på hvis man har lyst til å se queries
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
