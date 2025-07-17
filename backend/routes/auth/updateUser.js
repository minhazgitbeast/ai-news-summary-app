import express from "express";
import User from "../../models/User.js";
import verifyToken from "../../middleware/auth.js";

const router = express.Router();

router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

export default router;
