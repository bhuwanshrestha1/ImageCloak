import express from "express";
import { sendMessage, getMessage } from "../controllers/messageController.js";
import protectRoute from "../middlewares/protectRoute.js";
import upload from "../middlewares/uploadMiddleware.js";  // Import multer upload middleware

const router = express.Router();

router.post("/send/:id", protectRoute, upload.single("image"), sendMessage); // Accepts image
router.get("/:id", protectRoute, getMessage);

export default router;
