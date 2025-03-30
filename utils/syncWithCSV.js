import { db } from "../drizzle/db.js";
import { productsRaw, productsInventory } from "../drizzle/schema.js";
import createProduct from "./createProduct.js";
import axios from "axios";

// פונקציות למחיקה ועדכון
const deleteProduct = async (wooId) => {
  try {
    const res = await axios.delete(`${process.env.WC_API_URL}/products/${wooId}`, {
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

const updateProduct = async (wooId, totalPrice) => {
  try {
    const res = await axios.put(`${process.env.WC_API_URL}/products/${wooId}`, {
      regular_price: totalPrice.toString(),
    }, {
      auth: {
        username: process.env.WC_CONSUMER_KEY,
        password: process.env.WC_CONSUMER_SECRET,
      },
    });
    console.log(`✏️ Updated price for WooCommerce product ID: ${wooId}`);
  } catch (err) {
    console.error(`❌ Failed to update product ${wooId}:`, err.response?.data || err.message);
  }
};

const syncWithCSV = async () => {
  try {
    console.log("🔄 Starting full sync with CSV...");

    const [csvProducts, wooProducts] = await Promise.all([
      db.select().from(productsRaw),
      db.select().from(productsInventory),
    ]);

    const csvMap = new Map(csvProducts.map(p => [p.sku, p]));
    const wooMap = new Map(wooProducts.map(p => [p.sku, p]));

    const toAdd = [];
    const toDelete = [];
    const toUpdate = [];

    for (const [sku, csvItem] of csvMap.entries()) {
      if (!wooMap.has(sku)) {
        toAdd.push(csvItem);
      } else {
        const wooItem = wooMap.get(sku);
        const csvPrice = parseFloat(csvItem.totalPrice);
        const wooPrice = parseFloat(wooItem.totalPrice);

        if (!isNaN(csvPrice) && csvPrice !== wooPrice) {
          toUpdate.push({
            wooId: wooItem.woo_id,
            newPrice: csvPrice,
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
      await createProduct(item);
    }

    for (const wooId of toDelete) {
      await deleteProduct(wooId);
    }

    for (const item of toUpdate) {
      await updateProduct(item.wooId, item.newPrice);
    }

    console.log("✅ Full sync complete!");
  } catch (error) {
    console.error("❌ Error during syncWithCSV:", error);
  }
};

export default syncWithCSV;