import Message from "../models/Message.js";

// Create a new message (for the contact form)
export const createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const newMessage = new Message({ name, email, message, status: "pending" });

    await newMessage.save();

    res.status(201).json({
      message: "Message received successfully. We will get back to you soon.",
      data: newMessage,
    });
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get all messages (for admin view)
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find();

    // If no messages, return a message
    if (messages.length === 0) {
      return res
        .status(404)
        .json({
          message: "There is no any New Message available in your inbox",
        });
    }

    // Send success response with messages
    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Get a single message by ID (for admin to view a specific message)
export const getMessageById = async (req, res) => {
  try {
    const { id } = req.body; // use body instead of params

    // Find the message by ID
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Send success response with the message details
    res.status(200).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Reply to a message (for the admin to respond)
export const replyToMessage = async (req, res) => {
  try {
    const { id, response } = req.body;

    // Validate if response is provided
    if (!response) {
      return res.status(400).json({ message: "Response is required" });
    }

    // Find the message by ID and update with the response
    const message = await Message.findByIdAndUpdate(
      id,
      {
        response,
        responseDate: new Date(),
        status: "resolved", // Set status to resolved after a reply
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Send success response with the updated message
    res.status(200).json({
      message: "Response sent successfully",
      data: message,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Update message status (to mark as 'read' or 'resolved')
export const updateMessageStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    // Validate the status value
    if (!["pending", "read", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the message by ID and update its status
    const message = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Send success response with the updated message
    res.status(200).json({
      message: "Status updated successfully",
      data: message,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Delete a message (for admin to delete a specific message)
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.body; // Get the message ID from the body

    // Ensure that the id is provided in the request body
    if (!id) {
      return res.status(400).json({ message: "Message ID is required" });
    }

    // Find and delete the message by ID
    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Send success response
    res.status(200).json({
      message: "Message deleted successfully",
      data: deletedMessage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
