// routes/auth/getUserById.js

import express from "express";
import User from "../../models/User.js";
import verifyToken from "../../middleware/auth.js";
import logger from "../../logger.js";

const router = express.Router();

/**
 * GET /api/auth/user/:id
 * Fetch a single user by their MongoDB ObjectId
 */
router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      logger.error({
        message: "User not found",
        status: 404,
        route: req.originalUrl,
        time: new Date().toISOString(),
      });
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    logger.error({
      message: "Fetching user failed",
      error: err.message,
      status: 500,
      route: req.originalUrl,
      time: new Date().toISOString(),
    });

    // Specific handling for invalid ObjectId
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});

export default router;
