import cloudinary from '../config/cloudinary.js';  // Import Cloudinary configuration
import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';

export const sendMessage = async (req, res) => {
    try {
      const { message } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user._id;
      let imageUrl = null;
  
      // If an image is uploaded, upload it to Cloudinary
      if (req.file) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            {
              resource_type: 'image',
              public_id: `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, "")}`, 
            },
            (error, result) => {
              if (error) {
                console.log('Cloudinary upload error:', error);  // Log error if upload fails
                reject(error);
              } else {
                console.log('Cloudinary upload result:', result);  // Log the upload result
                resolve(result);
              }
            }
          );
          
          // Stream the buffer to Cloudinary
          stream.end(req.file.buffer);
        });
  
        // Set the image URL from Cloudinary's response
        imageUrl = uploadResult.secure_url;
      }
  
      // Find or create the conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });
  
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }
  
      // Create the message
      const newMessage = new Message({
        senderId,
        receiverId,
        message,
        image: imageUrl, // Store the Cloudinary image URL
      });
  
      if (newMessage) {
        conversation.messages.push(newMessage._id);
      }
  
      await Promise.all([conversation.save(), newMessage.save()]);
  
      res.status(201).json(newMessage);
    } catch (error) {
      console.log('Error in sendMessage controller: ', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
};

  
  
export const getMessage = async (req, res) => {
    try {
      const { id: userToChatId } = req.params;
      const senderId = req.user._id;
  
      // Find the conversation between sender and receiver
      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, userToChatId] },
      }).populate("messages");
  
      if (!conversation) {
        return res.status(200).json([]); // Return empty array if no conversation found
      }
  
      // Prepare messages with image URLs if available
      const messages = conversation.messages.map((msg) => {
        return {
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          message: msg.message,
          image: msg.image,  // Cloudinary URL already stored
        };
      });
  
      // Send the messages as the response
      res.status(200).json(messages);
    } catch (error) {
      console.log("Error in getMessage controller: ", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  