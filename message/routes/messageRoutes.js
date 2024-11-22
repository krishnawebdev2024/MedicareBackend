import express from "express";
import {
  createMessage,
  getAllMessages,
  getMessageById,
  replyToMessage,
  updateMessageStatus,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();

// Route to create a new message (for the contact form)
router.post("/", createMessage);

// Route to get all messages (for admin view)
router.get("/", getAllMessages);

// Route to get a single message by ID (for admin to view a specific message)
router.post("/view", getMessageById);

// Route for admin to reply to a message
router.post("/reply", replyToMessage);

// Route for admin to update message status
router.post("/status", updateMessageStatus);

// Route for admin to delete a message
router.delete("/delete", deleteMessage);

export default router;
