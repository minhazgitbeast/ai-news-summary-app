import express from "express";
import axios from "axios";
import verifyToken from "../../middleware/auth.js";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import logger from "../../logger.js";
import User from "../../models/User.js";
import Content from "../../models/Content.js";

const router = express.Router();

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";
const TOGETHER_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";

// Generate title from keywords
const generateTitleFromKeywords = (keywords) => {
  if (!keywords || keywords.length === 0) return "Untitled";
  const titleKeywords = keywords.slice(0, 4).join(" • ");
  return titleKeywords.length > 50
    ? titleKeywords.substring(0, 50) + "..."
    : titleKeywords;
};

// Save summary to Content collection
const saveSummaryToContent = async (
  userId,
  originalText,
  summary,
  keywords = []
) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const title = generateTitleFromKeywords(keywords);

    const newContent = new Content({
      title,
      originalText,
      summary,
      keywords,
      user: userId,
      userName: user.name,
      userEmail: user.email,
    });

    await newContent.save();
    console.log(`✅ Summary saved for user ${userId}`);
  } catch (err) {
    logger.error({
      message: "❌ Failed to save summary to content",
      error: err.message,
      time: new Date().toISOString(),
    });
  }
};

// Call Together API
const getSummaryAndKeywords = async (text) => {
  const response = await axios.post(
    TOGETHER_API_URL,
    {
      model: TOGETHER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes news articles and provides keywords. Provide only the summary and keywords without any additional notes or explanations. The summary must be between 50-100 words.",
        },
        {
          role: "user",
          content: `Summarize the following text in exactly 75-100 words and extract 3-5 keywords. Do not repeat information. Format your response as: [Summary] Keywords: [comma-separated keywords]\n${text}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.5,
    },
    {
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const result = response.data.choices[0].message.content.trim();

  // Clean AI notes
  const cleanedResult = result
    .replace(/Note:.*?\./gi, "")
    .replace(/The provided text is brief.*?keywords\./gi, "")
    .replace(/I've generated.*?keywords\./gi, "")
    .replace(/If you provide.*?keywords\./gi, "")
    .replace(/This is a.*?summary\./gi, "")
    .replace(/Based on.*?knowledge.*?\./gi, "")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  const [summaryPart, keywordPart] = cleanedResult.split("Keywords:");
  let summary = summaryPart?.trim() || "";

  // Ensure summary length 50–100 words
  const wordCount = summary.split(/\s+/).filter(Boolean).length;
  if (wordCount < 50) {
    summary = summary + " " + summary.split(".").slice(0, 2).join(".");
  } else if (wordCount > 100) {
    const words = summary.split(/\s+/);
    summary = words.slice(0, 100).join(" ");
    const lastPeriod = summary.lastIndexOf(".");
    if (lastPeriod > summary.length * 0.8) {
      summary = summary.substring(0, lastPeriod + 1);
    }
  }

  const keywords = keywordPart
    ? keywordPart
        .trim()
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  return { summary, keywords };
};

// Extract content from URL
const extractContentFromURL = async (url) => {
  const pageResponse = await axios.get(url);
  const dom = new JSDOM(pageResponse.data, { url });
  const reader = new Readability(dom.window.document);
  let content = reader.parse()?.textContent?.replace(/\s+/g, " ").trim();

  if (!content || content.length < 50) {
    content = extractFallbackContent(dom.window.document);
  }

  return content;
};

// Fallback methods
const extractFallbackContent = (document) => {
  const meta = document.querySelector('meta[name="description"]')?.content;
  if (meta && meta.length > 50) return meta;

  const articleText = document
    .querySelector("article")
    ?.textContent?.replace(/\s+/g, " ")
    .trim();
  if (articleText && articleText.length > 50) return articleText;

  const mainText = document
    .querySelector("main")
    ?.textContent?.replace(/\s+/g, " ")
    .trim();
  if (mainText && mainText.length > 50) return mainText;

  return null;
};

// Route: Only 'text' or 'url'
router.post("/", verifyToken, async (req, res) => {
  const { text, url, save = true } = req.body;
  const userId = req.user?.userId || req.user?.id;

  let inputContent = null;

  if (text) {
    inputContent = text;
  } else if (url) {
    try {
      inputContent = await extractContentFromURL(url);
      if (!inputContent || inputContent.length < 50) {
        return res.status(400).json({
          message: "Could not extract enough content from the URL.",
          suggestion: "Try a different URL or paste the text directly.",
        });
      }
    } catch (err) {
      return res.status(400).json({
        message: "Failed to extract content from URL.",
        error: err.message,
      });
    }
  }

  if (!inputContent) {
    return res.status(400).json({ error: "Send either 'text' or 'url'" });
  }

  try {
    const { summary, keywords } = await getSummaryAndKeywords(inputContent);
    const title = generateTitleFromKeywords(keywords);

    if (save) {
      await saveSummaryToContent(userId, inputContent, summary, keywords);
    }

    res.json({
      title,
      summary,
      keywords,
      saved: !!save,
    });
  } catch (err) {
    logger.error({
      message: "Summarization failed",
      error: err.message,
      route: req.originalUrl,
      status: 500,
      time: new Date().toISOString(),
    });
    res.status(500).json({
      message: "Failed to generate summary",
      error: err.message,
    });
  }
});

export default router;
