import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";

// Load .env config
dotenv.config();

// Config values directly in app.js
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI || !JWT_SECRET) {
  throw new Error("Environment variables missing (MONGO_URI or JWT_SECRET)");
}

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/", routes);

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB Error:", err));
