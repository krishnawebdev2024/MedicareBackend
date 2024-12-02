import mongoose from "mongoose";

const pdfRecordSchema = new mongoose.Schema(
  {
    pdfUrl: {
      type: String,
      required: true,
    },
    user: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true },
      image: { type: String },
    },
  },
  { timestamps: true }
);

const PDFRecord = mongoose.model("PDFRecord", pdfRecordSchema);

export default PDFRecord;
