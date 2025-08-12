// routes/auth/getAllUsers.js

import express from "express";
import User from "../../models/User.js";
import verifyToken from "../../middleware/auth.js";
import logger from "../../logger.js";

const router = express.Router();

/**
 * GET /api/auth/users
 * Returns a list of all users (excluding passwords)
 */
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    logger.error({
      message: "Fetching users failed",
      status: 500,
      route: "/api/auth/users",
      error: err.message,
      time: new Date().toISOString(),
    });
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: err.message });
  }
});

export default router;
