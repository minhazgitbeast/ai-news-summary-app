import express from "express";
import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import logger from "../../logger.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      logger.error({
        message: "User already exists",
        status: 400,
        route: req.originalUrl,
        time: new Date().toISOString(),
      });
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    logger.error({
      message: "Signup failed",
      error: err.message,
      status: 500,
      route: req.originalUrl,
      time: new Date().toISOString(),
    });
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

export default router;
