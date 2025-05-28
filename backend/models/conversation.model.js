import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: [],  // Ensures that the messages array is empty if no messages are present
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create an index on participants to speed up queries for finding conversations
conversationSchema.index({ participants: 1 });

export default mongoose.model("Conversation", conversationSchema);
