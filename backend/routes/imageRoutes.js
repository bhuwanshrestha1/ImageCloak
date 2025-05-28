import express from 'express';
import upload from '../middlewares/uploadMiddleware.js';  // Multer upload middleware
import { deleteImage, getImage, uploadImage } from '../controllers/uploadController.js'; // Image controllers
import protectRoute from '../middlewares/protectRoute.js'; // Protect the route (authentication)

const router = express.Router();

// Image upload route
router.post('/upload', protectRoute, upload.single('image'), uploadImage);  // 'image' matches the frontend field name

// Get user uploaded images
router.get('/', protectRoute, getImage);

router.delete('/delete/:imageId', protectRoute, deleteImage);

export default router;
