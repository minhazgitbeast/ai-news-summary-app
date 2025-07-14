import express from "express";
import userRoutes from "./user.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Backend is running!");
});

router.use("/api/auth", userRoutes);

export default router;
