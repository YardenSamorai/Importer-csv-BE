import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import { db } from "../drizzle/db.js";
import { productsRaw, uploadLogs,productsInventory } from "../drizzle/schema.js";
import { and, gte, lte } from "drizzle-orm/expressions";
// ❌ הסרנו את syncInventory כי לא צריך אותו פה

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  const results = [];
  let status = "Success";

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        console.log("First row:", results[0]);

        const formatted = results.map((row) => ({
          category: row["Category"],
          sku: row["SKU"],
          shape: row["Shape"],
          weight: parseFloat(row["Weight"]),
          color: row["Color"],
          clarity: row["Clarity"],
          lab: row["Lab"],
          fluorescence: row["Fluorescence"],
          pricePerCarat: parseFloat(row["Price Per Carat"]),
          rapPricePercent: parseFloat(row["Rap Price %"]),
          rapPrice: parseFloat(row["Rap. Price"]),
          totalPrice: parseFloat(row["Total Price"]),
          location: row["Location"],
          image: row["Image"],
          video: row["Video"],
          certificateImage: row["Certificate image"],
          certificateNumber: row["Certificate Number"],
          cut: row["Cut"],
          polish: row["Polish"],
          symmetry: row["Symmetry"],
          table: parseFloat(row["Table"]),
          depth: parseFloat(row["Depth"]),
          ratio: parseFloat(row["ratio"]),
          measurements: row["Measurements (- delimiter)"],
          pairStone: row["Pair Stone"],
          fancyIntensity: row["fancy_intensity"],
          fancyColor: row["fancy_color"],
          fancyOvertone: row["fancy_overtone"],
          fancyColor2: row["fancy_color_2"],
          fancyOvertone2: row["fancy_overtone_2"],
          homePage: row["home_page"],
          additionalPictures: row["additional_pictures"],
          branch: row["Branch"],
          additionalVideos: row["additional_videos"],
          comment: row["Comment"],
          type: row["Type"],
          certComments: row["Cert. Comments"],
          certificateImageJpg: row["certificateImageJPG"],
          origin: row["Origin"],
          tradeShow: row["TradeShow"],
        }));

        await db.delete(productsRaw);
        await db.insert(productsRaw).values(formatted);

        await db.insert(uploadLogs).values({
          filename: req.file.originalname,
          insertedRows: formatted.length,
          status: status,
        });

        res.json({ success: true, inserted: formatted.length });
      } catch (err) {
        console.error("❌ Error inserting data:", err);
        status = "Failed";
        res.status(500).json({ error: "Import failed" });
      } finally {
        fs.unlinkSync(req.file.path);
      }
    });
});

router.get("/logs", async (req, res) => {
  try {
    console.log("Fetching logs...");
    const logs = await db
      .select()
      .from(uploadLogs)
      .orderBy(uploadLogs.uploadedAt, 'desc')
      .limit(5);
    console.log("Fetched logs:", logs);
    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs", details: err.message });
  }
});

router.get("/logs/today/count", async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await db
      .select()
      .from(uploadLogs)
      .where(
        and(
          gte(uploadLogs.uploadedAt, startOfDay),
          lte(uploadLogs.uploadedAt, endOfDay)
        )
      );

    res.json({ count: logs.length });
  } catch (err) {
    console.error("❌ Error fetching today's logs count:", err);
    res.status(500).json({ error: "Failed to fetch today's logs count" });
  }
});

// בודק אילו מוצרים נמצאים בקובץ CSV ואילו באתר בפועל (products_inventory)
// משווה רק מוצרים באוויר (status === 'publish') ומתעלם ממוצרים מקטגוריית "jewelry"
router.post("/compare", async (req, res) => {
  try {
    const [dbInventory, csvRaw] = await Promise.all([
      db.select().from(productsInventory),
      db.select().from(productsRaw),
    ]);

    // 🔍 תנאים לסינון
    const isJewelry = (item) =>
      item.category?.toLowerCase().trim() === "jewelry";

    const isPublished = (item) =>
      item.status?.toLowerCase().trim() === "publish";

    // ✂️ סינון
    const dbFiltered = dbInventory.filter((p) => isPublished(p) && !isJewelry(p));
    const csvFiltered = csvRaw.filter((p) => !isJewelry(p));

    const skippedDueToStatus = dbInventory.length - dbFiltered.length;
    const skippedDueToJewelry = dbInventory.filter((p) => isJewelry(p)).length;

    console.log(`📊 Total in DB: ${dbInventory.length}`);
    console.log(`✅ Compared: ${dbFiltered.length}`);
    console.log(`🛑 Skipped ${skippedDueToStatus} due to status != publish`);
    console.log(`🛑 Skipped ${skippedDueToJewelry} due to category = jewelry`);

    const existingSKUs = new Set(dbFiltered.map((p) => p.sku));
    const newSKUs = new Set(csvFiltered.map((p) => p.sku));

    const added = csvFiltered.filter((p) => !existingSKUs.has(p.sku));
    const removed = dbFiltered.filter((p) => !newSKUs.has(p.sku));
    const existing = csvFiltered.filter((p) => existingSKUs.has(p.sku));

    const result = {
      addedCount: added.length,
      removedCount: removed.length,
      existingCount: existing.length,
      addedSKUs: added.map((p) => p.sku),
      removedSKUs: removed.map((p) => p.sku),
    };

    res.json(result);
  } catch (err) {
    console.error("❌ Error comparing inventories:", err);
    res.status(500).json({ error: "Comparison failed" });
  }
});
export default router;
