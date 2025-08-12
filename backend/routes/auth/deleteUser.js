import express from "express";
import User from "../../models/User.js";
import verifyToken from "../../middleware/auth.js";
import logger from "../../logger.js";

const router = express.Router();

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      logger.error({
        message: "User not found",
        status: 404,
        route: req.originalUrl,
        time: new Date().toISOString(),
      });
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" }); // ✅ Now reachable
  } catch (err) {
    logger.error({
      message: "Deletion failed",
      error: err.message,
      status: 500,
      route: req.originalUrl,
      time: new Date().toISOString(),
    });
    res.status(500).json({ message: "Deletion failed", error: err.message });
  }
});

export default router;
