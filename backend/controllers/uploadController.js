import cloudinary from '../config/cloudinary.js';  // Your Cloudinary config
import Upload from '../models/uploadImage.js'; // Assuming this is your image model

// Image upload handler
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, "")}`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(req.file.buffer);
    });

    // Save image info to MongoDB
    const newImage = new Upload({
      userId: req.user._id, // Assuming user is authenticated
      image: uploadResult.secure_url, // URL from Cloudinary
    });

    await newImage.save();

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: newImage,
    });
  } catch (error) {
    console.error('Error in uploadImage controller:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch uploaded images
export const getImage = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is authenticated

    // Find all images uploaded by the user
    const images = await Upload.find({ userId });

    if (!images.length) {
      return res.status(404).json({ message: 'No images found for this user' });
    }

    res.status(200).json(images);
  } catch (error) {
    console.error('Error in getImage controller:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;  // Extract image ID from URL

    // Find and delete the image by ID
    const deletedImage = await Upload.findByIdAndDelete(imageId);

    if (!deletedImage) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error in deleteImage controller:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};