import express from "express";
import { db } from "../drizzle/db.js";
import { productsInventory } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const router = express.Router();

// ✅ מחזיר את כל המוצרים
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 150;
    const offset = (page - 1) * limit;

    const products = await db
      .select()
      .from(productsInventory)
      .limit(limit)
      .offset(offset);

    const countRes = await db.select().from(productsInventory);
    const total = countRes.length;

    res.json({
      data: products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ Error fetching inventory:", err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// ✅ מחזיר רק את כמות המוצרים
router.get("/count", async (req, res) => {
  try {
    const countResult = await db
      .select()
      .from(productsInventory)
      .where(eq(productsInventory.status, "publish"));

    res.json({ count: countResult.length });
  } catch (err) {
    console.error("❌ Error fetching inventory count:", err);
    res.status(500).json({ error: "Failed to fetch count" });
  }
});

export default router;
