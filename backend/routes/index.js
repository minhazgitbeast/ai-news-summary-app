import express from "express";

// ===========================
// Auth routes
// ===========================
import createUser from "./auth/createUser.js";
import signin from "./auth/signin.js";
import updateUser from "./auth/updateUser.js";
import getUserById from "./auth/getUserById.js";
import deleteUser from "./auth/deleteUser.js";
import getAllUsers from "./auth/getAllUsers.js";

// ===========================
// Summary routes
// ===========================
import openaiSummary from "./summary/openaiSummary.js";
import getAllSummaries from "./summary/getAllSummaries.js"; // GET /api/summary/ (paginated, all summaries)
import getSummaryById from "./summary/getSummariesById.js"; // GET /api/summary/:userId/:summaryId
import getSummariesByUser from "./summary/getSummariesByUser.js"; // GET /api/summary/user/:userId
import getSummaryBySummaryId from "./summary/getSummaryBySummaryId.js"; // GET /api/summary/id/:summaryId
import deleteSummary from "./summary/deleteSummary.js"; // DELETE /api/summary/:summaryId
import updateSummary from "./summary/updateSummary.js"; // PUT /api/summary/:summaryId

const router = express.Router();

// ===========================
// Health check
// ===========================
router.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ===========================
// Auth Routes
// ===========================
router.use("/api/auth", createUser);
router.use("/api/auth", signin);
router.use("/api/auth", updateUser);
router.use("/api/auth", deleteUser);
router.use("/api/auth", getAllUsers);
router.use("/api/auth", getUserById);

// ===========================
// Summary Routes
// ===========================

// Generate + save summaries using Together/OpenAI API
router.use("/api/openai", openaiSummary);

// --- More specific routes first to avoid conflicts ---
router.use("/api/summary/user", getSummariesByUser); // GET /api/summary/user/:userId
router.use("/api/summary/id", getSummaryBySummaryId); // GET /api/summary/id/:summaryId (by summary ID only)
router.use("/api/summary", getSummaryById); // GET /api/summary/:userId/:summaryId
router.use("/api/summary", updateSummary); // PUT /api/summary/:summaryId
router.use("/api/summary", deleteSummary); // DELETE /api/summary/:summaryId

// This must be last because it's the "catch-all" GET /
router.use("/api/summary", getAllSummaries); // GET /api/summary/

export default router;
