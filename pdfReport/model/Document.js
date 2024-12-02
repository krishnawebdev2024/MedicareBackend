import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true, // Firebase URL to access the uploaded PDF
    },
    parsedContent: {
      type: String, // The text content extracted from the PDF
      required: true,
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;
