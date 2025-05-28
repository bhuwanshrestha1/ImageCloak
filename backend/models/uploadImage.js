import mongoose from "mongoose";

// Image Schema to store image URL and metadata
const imageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who uploaded the image
      required: true,
    },
    image: {
      type: String, // Store the image URL from Cloudinary
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export default mongoose.model("Upload", imageSchema);
