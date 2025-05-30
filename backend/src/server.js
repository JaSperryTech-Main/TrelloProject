import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";

// Enable ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

const coreConfig = {
  origin: ["http://localhost", "http://localhost:80", 'http://frontend', 'http://backend:3000'],
  credentials: true,
};
app.use(cors(coreConfig));

// Body parser
app.use(express.json());

// API routes
app.use("/api", routes);

// Serve static frontend
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// Handle client-side routing (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Listening on http://localhost:${PORT}`);
});
