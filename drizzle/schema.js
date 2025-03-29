import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";

export const productsRaw = pgTable("products_raw", {
  id: serial("id").primaryKey(),
  category: text("category"),
  sku: text("sku"),
  shape: text("shape"),
  weight: numeric("weight"),
  color: text("color"),
  clarity: text("clarity"),
  lab: text("lab"),
  fluorescence: text("fluorescence"),
  pricePerCarat: numeric("price_per_carat"),
  rapPricePercent: numeric("rap_price_percent"),
  rapPrice: numeric("rap_price"),
  totalPrice: numeric("total_price"),
  location: text("location"),
  image: text("image"),
  video: text("video"),
  certificateImage: text("certificate_image"),
  certificateNumber: text("certificate_number"),
  cut: text("cut"),
  polish: text("polish"),
  symmetry: text("symmetry"),
  table: numeric("table"),
  depth: numeric("depth"),
  ratio: numeric("ratio"),
  measurements: text("measurements"),
  pairStone: text("pair_stone"),
  fancyIntensity: text("fancy_intensity"),
  fancyColor: text("fancy_color"),
  fancyOvertone: text("fancy_overtone"),
  fancyColor2: text("fancy_color_2"),
  fancyOvertone2: text("fancy_overtone_2"),
  homePage: text("home_page"),
  additionalPictures: text("additional_pictures"),
  branch: text("branch"),
  additionalVideos: text("additional_videos"),
  comment: text("comment"),
  type: text("type"),
  certComments: text("cert_comments"),
  certificateImageJpg: text("certificate_image_jpg"),
  origin: text("origin"),
  tradeShow: text("trade_show"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const uploadLogs = pgTable("upload_logs", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  insertedRows: integer("inserted_rows").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

  export const productsInventory  = pgTable("products_inventory", {
    id: serial("id").primaryKey(),
  
    category: text("category"),
    sku: text("sku"),
    shape: text("shape"),
    weight: numeric("weight"),
    color: text("color"),
    clarity: text("clarity"),
    lab: text("lab"),
    fluorescence: text("fluorescence"),
    pricePerCarat: numeric("price_per_carat"),
    rapPricePercent: numeric("rap_price_percent"),
    rapPrice: numeric("rap_price"),
    totalPrice: numeric("total_price"),
    location: text("location"),
    image: text("image"),
    video: text("video"),
    certificateImage: text("certificate_image"),
    certificateNumber: text("certificate_number"),
    cut: text("cut"),
    polish: text("polish"),
    symmetry: text("symmetry"),
    table: numeric("table"),
    depth: numeric("depth"),
    ratio: numeric("ratio"),
    measurements: text("measurements"),
    pairStone: text("pair_stone"),
    fancyIntensity: text("fancy_intensity"),
    fancyColor: text("fancy_color"),
    fancyOvertone: text("fancy_overtone"),
    fancyColor2: text("fancy_color_2"),
    fancyOvertone2: text("fancy_overtone_2"),
    homePage: text("home_page"),
    additionalPictures: text("additional_pictures"),
    branch: text("branch"),
    additionalVideos: text("additional_videos"),
    comment: text("comment"),
    type: text("type"),
    certComments: text("cert_comments"),
    certificateImageJpg: text("certificate_image_jpg"),
    origin: text("origin"),
    tradeShow: text("trade_show"),
  
    uploadedAt: timestamp("uploaded_at").defaultNow(),
  });