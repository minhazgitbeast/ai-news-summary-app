import express from "express";
import User from "../../models/User.js";
import verifyToken from "../../middleware/auth.js";
import logger from "../../logger.js";

const router = express.Router();

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updatedUser) {
      logger.error({
        message: "User not found",
        id: req.params.id,
        status: 404,
        route: "/:id",
        time: new Date().toISOString(),
      });
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    logger.error({
      message: "Update failed",
      id: req.params.id,
      status: 500,
      route: "/:id",
      error: err.message,
      time: new Date().toISOString(),
    });
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

export default router;
