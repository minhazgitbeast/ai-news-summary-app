import express from "express";
import verifyToken from "../../middleware/auth.js";
import Content from "../../models/Content.js";
import logger from "../../logger.js";

const router = express.Router();

// GET a specific summary by summaryId (only for authenticated owner)
router.get("/:summaryId", verifyToken, async (req, res) => {
  const { summaryId } = req.params;
  const userId = req.user?.userId || req.user?.id;

  try {
    const summary = await Content.findOne({
      _id: summaryId,
      user: userId,
    });

    if (!summary) {
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
      message: "Summary fetched successfully",
      summaryId,
      userId,
      time: new Date().toISOString(),
    });

    res.json(summary);
  } catch (err) {
    logger.error({
      message: "Error fetching summary",
      error: err.message,
      status: 500,
      route: req.originalUrl,
      time: new Date().toISOString(),
    });
    res
      .status(500)
      .json({ message: "Failed to fetch summary", error: err.message });
  }
});

export default router;
