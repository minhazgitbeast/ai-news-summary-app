import express from "express";
import verifyToken from "../../middleware/auth.js";
import Content from "../../models/Content.js";
import logger from "../../logger.js";

const router = express.Router();

// Update a specific summary
router.put("/:summaryId", verifyToken, async (req, res) => {
  const { summaryId } = req.params;
  const { title, body } = req.body;
  const userId = req.user?.userId || req.user?.id;

  if (!title && !body) {
    return res
      .status(400)
      .json({ error: "At least one field (title or body) is required" });
  }

  try {
    // Find and update the summary, ensuring it belongs to the current user
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (body !== undefined) updateData.summary = body; // Map body to summary field

    const updatedSummary = await Content.findOneAndUpdate(
      { _id: summaryId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSummary) {
      return res
        .status(404)
        .json({ error: "Summary not found or access denied" });
    }

    logger.info({
      message: "Summary updated successfully",
      summaryId,
      userId,
      time: new Date().toISOString(),
    });

    res.json({
      message: "Summary updated successfully",
      summary: updatedSummary,
    });
  } catch (err) {
    logger.error({
      message: "Failed to update summary",
      error: err.message,
      summaryId,
      userId,
      time: new Date().toISOString(),
    });
    res.status(500).json({ error: "Failed to update summary" });
  }
});

export default router;
