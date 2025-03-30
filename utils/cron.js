// cron.js
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import cron from "node-cron";
import syncInventory from "./seedInventory.js";

cron.schedule("0 */3 * * *", async () => {
    console.log("⏰ Running scheduled syncInventory (every 3 hours)...");
    await syncInventory();
  });

  console.log("PORT: ", process.env.PORT );
  console.log("URL: ", process.env.WC_API_URL );
  console.log("POSTGRES URL: ", process.env.DATABASE_URL);
  syncInventory();
  