import express from "express";
import verifyToken from "../../middleware/auth.js";
import Content from "../../models/Content.js";
import logger from "../../logger.js";

const router = express.Router();

// DELETE a specific summary by ID (only by the authenticated user)
router.delete("/delete/:summaryId", verifyToken, async (req, res) => {
  const userId = req.user?.userId || req.user?.id;
  const { summaryId } = req.params;

  try {
    // Find and delete the summary, ensuring it belongs to the current user
    const deletedSummary = await Content.findOneAndDelete({
      _id: summaryId,
      user: userId,
    });

    if (!deletedSummary) {
      logger.error({
        message: "Summary not found or access denied",
        status: 404,
        route: req.originalUrl,
        time: new Date().toISOString(),
      });
      return res
        .status(404)
        .json({ message: "Summary not found or access denied" });
    }

    logger.info({
      message: "Summary deleted successfully",
      summaryId,
      userId,
      time: new Date().toISOString(),
    });

    res.json({ message: "Summary deleted successfully" });
  } catch (err) {
    logger.error({
      message: "Failed to delete summary",
      error: err.message,
      route: req.originalUrl,
      status: 500,
      time: new Date().toISOString(),
    });
    res
      .status(500)
      .json({ message: "Failed to delete summary", error: err.message });
  }
});

export default router;
