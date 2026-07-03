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
    // Connexion directe (port 5432) requise pour les migrations : le pooler
    // transactionnel Supabase (port 6543) ne supporte pas les migrations Prisma.
    url: process.env["DIRECT_URL"],
  },
});
