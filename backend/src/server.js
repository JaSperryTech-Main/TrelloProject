import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import routes from "./routes/index.js";

const coreConfig = {
  origin: ["http://localhost", "http://localhost:80", 'http://frontend', 'http://backend:3000'],
  credentials: true,
};

dotenv.config();

const app = express();

app.use(cors(coreConfig));

app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Listening on http://localhost:${PORT}`);
});
