import express from "express";
import createUser from "./auth/createUser.js";
import signin from "./auth/signin.js";
import updateUser from "./auth/updateUser.js";
import getUserById from "./auth/getUserById.js";
import deleteUser from "./auth/deleteUser.js";
import openaiSummary from "./summary/openaiSummary.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Backend is running!");
});

router.use("/api/auth", createUser);
router.use("/api/auth", signin);
router.use("/api/auth", updateUser);
router.use("/api/auth", getUserById);
router.use("/api/auth", deleteUser);
router.use("/api/openai", openaiSummary);

export default router;
