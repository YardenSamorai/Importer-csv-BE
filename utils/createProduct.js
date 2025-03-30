import dotenv from "dotenv";
import path from "path";
import axios from "axios";

dotenv.config({ path: path.resolve("../.env") });

// 🗺️ מיפוי קטגוריות לשימוש פנימי
const CATEGORY_MAP = {
  diamonds: 16,
  emerald: 17,
  fancy: 18,
  gemstone: 36,
  jewelry: 64,
  uncategorized: 15,
};

const createProduct = async (productData) => {
  try {
    // 🧠 הפקת שם קטגוריה ודחיפת ID מתאים
    const categoryKey = productData.category?.toLowerCase().trim();
    const categoryId = CATEGORY_MAP[categoryKey] || CATEGORY_MAP.uncategorized;

    const newProduct = {
      name: `${productData.shape || ""} ${productData.weight || ""} ${productData.color || ""} ${productData.clarity || ""} ${productData.lab || ""}`.trim(),
      type: "simple",
      regular_price: productData.totalPrice?.toString() || "0",
      description: productData.comment || "",
      short_description: productData.comment?.slice(0, 80) || "",
      sku: productData.sku,
      manage_stock: true,
      stock_quantity: 1,
      categories: [
        { id: categoryId },
      ],
      images: productData.image
        ? [{ src: productData.image }]
        : [],
      status: "publish",
    };

    const res = await axios.post(
      `${process.env.WC_API_URL}/products`,
      newProduct,
      {
        auth: {
          username: process.env.WC_CONSUMER_KEY,
          password: process.env.WC_CONSUMER_SECRET,
        },
      }
    );

    console.log("✅ Product created:", res.data.id, res.data.name);
    return res.data;
  } catch (err) {
    console.log("API URL:", process.env.WC_API_URL);
    console.error("❌ Failed to create product:", err.response?.data || err.message);
  }
};

export default createProduct;