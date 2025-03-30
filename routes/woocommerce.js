import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const wcApi = axios.create({
  baseURL: process.env.WC_API_URL,
  auth: {
    username: process.env.WC_CONSUMER_KEY,
    password: process.env.WC_CONSUMER_SECRET,
  },
});
// GET /api/woocommerce/products
router.get("/products", async (req, res) => {
    try {
      let allProducts = [];
      let page = 1;
      let hasMore = true;
  
      while (hasMore) {
        const response = await axios.get(`${process.env.WC_API_URL}/products`, {
          auth: {
            username: process.env.WC_CONSUMER_KEY,
            password: process.env.WC_CONSUMER_SECRET,
          },
          params: {
            per_page: 100,
            page,
          },
        });
  
        const products = response.data;
        allProducts = allProducts.concat(products);
  
        // אם קיבלנו פחות מ-100 מוצרים, זה העמוד האחרון
        if (products.length < 100) {
          hasMore = false;
        } else {
          page++;
        }
      }
  
      res.json(allProducts);
    } catch (error) {
      console.error("❌ Error fetching products from WooCommerce:", error.message);
      res.status(500).json({ error: "Failed to fetch all products from WooCommerce" });
    }
  });
export default router;

