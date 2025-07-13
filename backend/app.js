import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Config
const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI:
    process.env.MONGO_URI || "mongodb://localhost:27017/ai-news-summary",
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "8f9a8f799dad4d3bce56f00c2bd21a147d534871c6cdb94ef4ae4e268a118db0",
};

// User Model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

// Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Signin failed", error: err.message });
  }
});

// Summary Route
app.post("/api/auth/summary", verifyToken, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "URL is required" });

  try {
    // Later use AI API
    const summary = `summerization of news from link: ${url}`;
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Summary failed", error: err.message });
  }
});

// MongoDB connect
mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(config.PORT, () => {
      console.log(`Server running on http://localhost:${config.PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB Error:", err));
