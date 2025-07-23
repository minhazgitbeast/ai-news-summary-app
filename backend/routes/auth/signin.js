import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../../models/User.js";
import logger from "../../logger.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN;

const router = express.Router();

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.error({
        message: "User not found during signin",
        email,
        status: 400,
        route: "/signin",
        time: new Date().toISOString(),
      });
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.error({
        message: "Invalid credentials",
        email,
        status: 400,
        route: "/signin",
        time: new Date().toISOString(),
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn });

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    logger.error({
      message: "Signin failed",
      error: err.message,
      status: 500,
      route: "/signin",
      time: new Date().toISOString(),
    });
    res.status(500).json({ message: "Signin failed", error: err.message });
  }
});

export default router;
