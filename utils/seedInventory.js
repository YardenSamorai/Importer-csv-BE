// utils/syncInventory.js

import "dotenv/config";
import axios from "axios";
import { db } from "../drizzle/db.js";
import { productsInventory } from "../drizzle/schema.js";

const fetchAllWooProducts = async () => {
  let page = 1;
  const perPage = 100;
  let allProducts = [];
  let keepFetching = true;

  console.log("🚀 Fetching all products from WooCommerce...");

  while (keepFetching) {
    const res = await axios.get(`${process.env.WC_API_URL}/products`, {
      auth: {
        username: process.env.WC_CONSUMER_KEY,
        password: process.env.WC_CONSUMER_SECRET,
      },
      params: { per_page: perPage, page },
    });

    const products = res.data;
    allProducts = allProducts.concat(products);

    if (products.length < perPage) {
      keepFetching = false;
    } else {
      page++;
    }
  }

  console.log(`✅ Fetched ${allProducts.length} products`);
  return allProducts;
};

const syncInventory = async () => {
  try {
    const products = await fetchAllWooProducts();

    const formatted = products.map((p) => {
      const attrMap = {};

      p.attributes?.forEach((attr) => {
        const name = attr.name.toLowerCase().trim();
        const value = attr.options?.[0] || null;

        if (name === "shape") attrMap.shape = value;
        if (name === "weight") attrMap.weight = parseFloat(value);
        if (name === "color") attrMap.color = value;
        if (name === "clarity") attrMap.clarity = value;
        if (name === "lab") attrMap.lab = value;
        if (name === "fluorescence") attrMap.fluorescence = value;
        if (name === "cut") attrMap.cut = value;
        if (name === "polish") attrMap.polish = value;
        if (name === "symmetry") attrMap.symmetry = value;
        if (name === "table") attrMap.table = parseFloat(value);
        if (name === "depth") attrMap.depth = parseFloat(value);
        if (name === "ratio") attrMap.ratio = parseFloat(value);
        if (name === "measurements") attrMap.measurements = value;
        if (name === "pair stone") attrMap.pairStone = value;
        if (name === "fancy intensity") attrMap.fancyIntensity = value;
        if (name === "fancy color") attrMap.fancyColor = value;
        if (name === "fancy overtone") attrMap.fancyOvertone = value;
        if (name === "fancy color 2") attrMap.fancyColor2 = value;
        if (name === "fancy overtone 2") attrMap.fancyOvertone2 = value;
        if (name === "origin") attrMap.origin = value;
      });

      p.meta_data?.forEach((meta) => {
        const key = meta.key.toLowerCase();
        const rawValue = meta.value;
        const value = typeof rawValue === "string" ? rawValue.replace("%", "") : rawValue;

        if (key === "_product_filter_table") attrMap.table = parseFloat(value);
        if (key === "_product_filter_depth") attrMap.depth = parseFloat(value);
        if (key === "_product_filter_lwd") attrMap.measurements = value;
        if (key === "_product_filter_lw_ratio") attrMap.ratio = parseFloat(value);
        if (key === "_product_filter_shape") attrMap.shape = value;
        if (key === "_product_filter_clarity") attrMap.clarity = value;
        if (key === "_product_filter_lab") attrMap.lab = value;
        if (key === "_product_filter_color_d") attrMap.color = value;
        if (key === "_product_filter_fluorescence") attrMap.fluorescence = value;
        if (key === "_product_filter_polish") attrMap.polish = value;
        if (key === "_product_filter_symmetry") attrMap.symmetry = value;
        if (key === "_product_filter_cut") attrMap.cut = value;
        if (key === "_product_filter_origin") attrMap.origin = value;
        if (key === "_product_filter_weight") attrMap.weight = parseFloat(value);
        if (key === "_product_filter_comments") attrMap.certComments = value;
        if (key === "_prudect_cert_link") attrMap.certificateImage = value;
        if (key === "_prudect_private_price_total") attrMap.totalPrice = parseFloat(value);
        if (key === "_product_filter_price_per_carat") attrMap.pricePerCarat = parseFloat(value);
        if (key === "_product_filter_rap") attrMap.rapPricePercent = value ? parseFloat(value.replace("%", "")) : null;
        if (key === "_product_filter_location") attrMap.location = value;
        if (key === "video_src_0") attrMap.video = value;
        if (key === "_product_filter_lab_num") attrMap.certificateNumber = value;
        if (key === "_pair_product_sku") attrMap.pairStone = value;
        if (key === "_product_filter_intensity") attrMap.fancyIntensity = value;
        if (key === "_product_filter_color_f") attrMap.fancyColor = value;
        if (key === "_product_filter_fancy_overtone") attrMap.fancyOvertone = value;
        if (key === "_product_filter_fancy_color_2") attrMap.fancyColor2 = value;
        if (key === "_product_filter_fancy_overtone_2") attrMap.fancyOvertone2 = value;
        if (key === "_product_attachments_list") attrMap.additionalPictures = value;
        if (key === "_item_comments") attrMap.certComments = value;
        if (key === "_product_filter_stone_type_e") attrMap.type = value;
        if (key === "_product_special") attrMap.tradeShow = value;
        if (key === "_product_filter_branch") attrMap.branch = value;
        if (key === "_product_filter_video_attachments") attrMap.additionalVideos = value;
        if (key === "_certificate_image_jpg") attrMap.certificateImageJpg = value;
      });

      return {
        sku: p.sku || null,
        pricePerCarat: parseFloat(p.price) || null,
        image: p.images?.[0]?.src || null,
        category: p.categories?.[0]?.name || null,
        comment: p.description || null,
        type: p.type || null,
        homePage: p.permalink || null,
        branch: p.tags?.[0]?.name || null,
        ...attrMap,
      };
    });

    await db.delete(productsInventory);
    await db.insert(productsInventory).values(formatted);

    console.log("✅ Inventory synced to database");
  } catch (error) {
    console.error("❌ Error syncing inventory:", error);
  }
};

export default syncInventory;
