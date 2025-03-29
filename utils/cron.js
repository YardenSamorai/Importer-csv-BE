// cron.js
import cron from "node-cron";
import syncInventory from "./seedInventory.js";

cron.schedule("0 */3 * * *", async () => {
    console.log("⏰ Running scheduled syncInventory (every 3 hours)...");
    await syncInventory();
  });