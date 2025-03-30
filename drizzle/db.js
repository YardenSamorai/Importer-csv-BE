// drizzle/db.js

import { drizzle } from "drizzle-orm/neon-http"; // ✅ שימוש נכון ב-Neon
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const sql = neon(process.env.DATABASE_URL); // חיבור ל-Neon
export const db = drizzle(sql, { schema });
