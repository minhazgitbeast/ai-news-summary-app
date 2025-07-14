import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//-----------------------Config--------------------------------------------------
const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI:
    process.env.MONGO_URI || "mongodb://localhost:27017/ai-news-summary",
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "8f9a8f799dad4d3bce56f00c2bd21a147d534871c6cdb94ef4ae4e268a118db0",
};

//-----------------------------------Routes-------------------------------------------------
app.use("/", routes);

//-------------------------------------MongoDB connect-----------------------------------------
mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(config.PORT, () => {
      console.log(`Server running on http://localhost:${config.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB Error:", err));
