import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: false, // Make it optional because a message could be just an image
    },
    image: {
      type: String, // Store the image URL or path
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
