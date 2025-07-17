import express from "express";
import User from "../../models/User.js";
import verifyToken from "../../middleware/auth.js";

const router = express.Router();

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // 👈 hides password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
});

export default router;
