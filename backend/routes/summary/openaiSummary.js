import express from "express";
import axios from "axios";
import verifyToken from "../../middleware/auth.js";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import logger from "../../logger.js";
import User from "../../models/User.js";

const router = express.Router();

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";

// Save summary to user's document
const saveSummaryToUser = async (userId, originalText, summary) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.summaries.push({ originalText, summary });
    await user.save();
  } catch (err) {
    logger.error({
      message: "Failed to save summary to user",
      error: err.message,
      time: new Date().toISOString(),
    });
  }
};

// Route: summarize plain text
router.post("/", verifyToken, async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  try {
    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes news articles.",
          },
          { role: "user", content: `Summarize the following text:\n${text}` },
        ],
        max_tokens: 200,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const summary = response.data.choices[0].message.content.trim();
    await saveSummaryToUser(req.user.id, text, summary);
    console.log(`Summary successfully saved for user ${req.user.id}`);
    res.json({ summary });
  } catch (error) {
    logger.error({
      message: "Together.ai API error",
      error: error.response?.data || error.message,
      status: 500,
      route: req.originalUrl,
      time: new Date().toISOString(),
    });
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// Route: summarize from a URL
router.post("/summary", verifyToken, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    logger.error({
      message: "URL is required",
      status: 400,
      route: req.originalUrl,
      time: new Date().toISOString(),
    });
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    const pageResponse = await axios.get(url);
    const html = pageResponse.data;

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const content = article?.textContent?.replace(/\s+/g, " ").trim();

    if (!content || content.length < 50) {
      logger.error({
        message: "Could not extract enough content from the URL.",
        status: 400,
        route: req.originalUrl,
        time: new Date().toISOString(),
      });
      return res
        .status(400)
        .json({ message: "Could not extract enough content from the URL." });
    }

    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes news articles.",
          },
          {
            role: "user",
            content: `Summarize the following text:\n${content}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const summary = response.data.choices[0].message.content.trim();
    await saveSummaryToUser(req.user.id, content, summary);
    console.log(`Summary successfully saved for user ${req.user.id}`);
    res.json({ summary });
  } catch (err) {
    logger.error({
      message: "Summary failed",
      error: err.message,
      status: 500,
      route: req.originalUrl,
      time: new Date().toISOString(),
    });
    res.status(500).json({ message: "Summary failed", error: err.message });
  }
});

export default router;
