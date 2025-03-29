import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

console.log("DATABASE_URL", process.env.DATABASE_URL); // רק לבדיקה

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // ✅ שינוי מ־connectionString ל־url
  },
});