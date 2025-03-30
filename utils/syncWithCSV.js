import { db } from "../drizzle/db.js";
import { productsRaw, productsInventory } from "../drizzle/schema.js";
import createProduct from "./createProduct.js";
import axios from "axios";

const CATEGORY_MAP = {
  diamond: 16,
  emerald: 17,
  fancy: 18,
  sapphire: 36,
  ruby: 36,
  spinel: 36,
  "garnet o": 36,
  "tourmaline o": 36,
  "tsavorite o": 36,
  "aquamarine": 36,
  "morganite o": 36,
  "kunzite o": 36,
  "chrome diopside o": 36,
  "amethyst o": 36,
  "tanzanite o": 36,
  gemstone: 36,
  jewelry: 64,
  uncategorized: 15,
};

// 🧹 מחיקת מוצר מהאתר
const deleteProduct = async (wooId) => {
  try {
    await axios.delete(`${process.env.WC_API_URL}/products/${wooId}`, {
      auth: {
        username: process.env.WC_CONSUMER_KEY,
        password: process.env.WC_CONSUMER_SECRET,
      },
      params: { force: true },
    });
    console.log(`🗑️ Deleted WooCommerce product ID: ${wooId}`);
  } catch (err) {
    console.error(`❌ Failed to delete product ${wooId}:`, err.response?.data || err.message);
  }
};

// ✏️ עדכון מחיר וקטגוריה
const updateProduct = async (wooId, totalPrice, categoryName) => {
  try {
    const categoryId = CATEGORY_MAP[categoryName?.toLowerCase()] || CATEGORY_MAP.uncategorized;
    console.log({categoryName:categoryName?.toLowerCase(),id: CATEGORY_MAP[categoryName?.toLowerCase()]});

    await axios.put(
      `${process.env.WC_API_URL}/products/${wooId}`,
      {
        regular_price: totalPrice.toString(),
        categories: [{ id: categoryId }],
      },
      {
        auth: {
          username: process.env.WC_CONSUMER_KEY,
          password: process.env.WC_CONSUMER_SECRET,
        },
      }
    );

    console.log(`✏️ Updated WooCommerce product ID ${wooId} | Price: ${totalPrice} | Category: ${categoryName}`);
  } catch (err) {
    console.error(`❌ Failed to update product ${wooId}:`, err.response?.data || err.message);
  }
};

// 🔁 סנכרון בין productsRaw לבין המלאי באתר
const syncWithCSV = async () => {
  try {
    console.log("🔄 Starting full sync with CSV...");

    const [csvProducts, wooProducts] = await Promise.all([
      db.select().from(productsRaw),
      db.select().from(productsInventory),
    ]);

    const csvMap = new Map(csvProducts.map((p) => [p.sku, p]));
    const wooMap = new Map(wooProducts.map((p) => [p.sku, p]));

    const toAdd = [];
    const toDelete = [];
    const toUpdate = [];

    for (const [sku, csvItem] of csvMap.entries()) {
      if (!wooMap.has(sku)) {
        console.log("🔄 wooMap not having addind sku ${sku}...",sku);

        console.log({csvItem});

        toAdd.push(csvItem);
      } else {
        console.log("🔄 wooMap  having update/delete sku ${sku}...",sku);

        console.log({csvItem});
        const wooItem = wooMap.get(sku);
        console.log("🔄 wooItem  wooItem ${sku}...");

        console.log({wooItem});
        const csvPrice = parseFloat(csvItem.totalPrice);
        const wooPrice = parseFloat(wooItem.totalPrice);

        const csvCategory = csvItem.category?.toLowerCase() || "uncategorized";
        const wooCategory = wooItem.category?.toLowerCase() || "uncategorized";

        const priceChanged = !isNaN(csvPrice) && csvPrice !== wooPrice;
        const categoryChanged = csvCategory !== wooCategory;
        console.log({
          wooId: wooItem.woo_id,
          newPrice: csvPrice,
          newCategory: csvCategory,
          sku,
        });
        if (priceChanged || categoryChanged) {
          toUpdate.push({
            wooId: wooItem.woo_id,
            newPrice: csvPrice,
            newCategory: csvCategory,
            sku,
          });
        }
      }
    }

    for (const [sku, wooItem] of wooMap.entries()) {
      const isJewelry = wooItem.category?.toLowerCase().trim() === "jewelry";
      const isDraft = wooItem.status?.toLowerCase().trim() === "draft";

      if (!csvMap.has(sku)) {
        if (isJewelry) {
          console.log(`🛑 Skip delete (jewelry): ${sku}`);
        } else if (isDraft) {
          console.log(`🛑 Skip delete (draft): ${sku}`);
        } else if (wooItem.woo_id) {
          toDelete.push(wooItem.woo_id);
        }
      }
    }

    console.log(`➕ ${toAdd.length} to add`);
    console.log(`🗑️ ${toDelete.length} to delete`);
    console.log(`✏️ ${toUpdate.length} to update`);

    for (const item of toAdd) {
      console.log("toAdd",{item});

      await createProduct(item);
    }

    for (const wooId of toDelete) {
      await deleteProduct(wooId);
    }

    for (const item of toUpdate) {
      console.log("toAdd",{item});

      await updateProduct(item.wooId, item.newPrice, item.newCategory);
    }

    console.log("✅ Full sync complete!");
  } catch (error) {
    console.error("❌ Error during syncWithCSV:", error);
  }
};

export default syncWithCSV;