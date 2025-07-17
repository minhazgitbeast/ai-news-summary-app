// routes/summary.js
import express from "express";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Summary route (secured)
router.post("/summary", verifyToken, async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ message: "URL is required" });

  try {
    // Placeholder for AI summarization
    // Later replace with real AI call 

    const summary = `Summary of the content from: ${url}`;

    // Example structure for future integration
    // const aiSummary = await generateSummaryFromURL(url); // to be implemented

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Summary failed", error: err.message });
  }
});

export default router;
