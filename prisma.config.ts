import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Connexion directe Prisma Postgres (db.prisma.io) requise pour les
    // migrations : la connexion poolée (pooled.db.prisma.io, DATABASE_URL)
    // ne supporte pas les migrations Prisma.
    url: process.env["DIRECT_URL"],
  },
});
