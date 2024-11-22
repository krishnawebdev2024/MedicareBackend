import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"], // email format validation
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "read", "resolved"],
      default: "pending", // Initial status is 'pending'
    },
    response: {
      type: String,
      default: "", // Initially empty, will be updated by the admin
    },
    responseDate: {
      type: Date,
      default: null, // Will be updated when the admin responds
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
