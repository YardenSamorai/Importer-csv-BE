import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import dotenv from "dotenv";

dotenv.config(); // נטען את .env

const client = postgres(process.env.DATABASE_URL, { max: 1, ssl: 'require' }); // חיבור מאובטח ל-Neon
export const db = drizzle(client, { schema });