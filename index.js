import express from "express";
import cors from "cors";
import "dotenv/config";
import uploadRoute from "./routes/upload.js"; // אם הנתיב שלך ב־upload.js
import woocommerceRoutes from "./routes/woocommerce.js";
import inventoryRoute from "./routes/inventory.js";
import "./utils/cron.js"; // מוסיפים את זה כדי להפעיל את הקרון


const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// חיבור הראוט
app.use("/api", uploadRoute); // מחבר את הנתיב api לראוט של upload.js

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/woocommerce", woocommerceRoutes);

app.use("/api/inventory", inventoryRoute); // מחבר את הנתיב api לראוט של inventory.js

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

