import { PrismaClient } from "@prisma/client";
export const db = new PrismaClient();
export const dbClient = {
    connect: () => console.log("DB client placeholder")
};
