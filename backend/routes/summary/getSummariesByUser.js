import express from "express";
import verifyToken from "../../middleware/auth.js";
import Content from "../../models/Content.js";
import logger from "../../logger.js";

const router = express.Router();

router.get("/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of summaries for this user
    const totalCount = await Content.countDocuments({ user: userId });

    // Get paginated summaries for this user
    const summaries = await Content.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      summaries,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
        limit,
      },
    });
  } catch (err) {
    logger.error({
      message: "Error fetching summaries",
      error: err.message,
      status: 500,
      route: req.originalUrl,
      time: new Date().toISOString(),
    });
    res
      .status(500)
      .json({ message: "Failed to fetch summaries", error: err.message });
  }
});

export default router;
