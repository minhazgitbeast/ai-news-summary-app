import express from "express";
import verifyToken from "../../middleware/auth.js";
import Content from "../../models/Content.js";

const router = express.Router();

// GET all summaries from all users (merged) with pagination
router.get("/", verifyToken, async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of summaries
    const totalCount = await Content.countDocuments({});

    // Get paginated summaries from Content collection
    const summaries = await Content.find({})
      .sort({ createdAt: -1 }) // Sort by creation date (newest first)
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
    console.error("Error fetching all summaries:", err);
    res.status(500).json({ message: "Failed to fetch summaries" });
  }
});

export default router;
