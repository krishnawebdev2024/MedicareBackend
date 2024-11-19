import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming the patient model is named "User"
      required: true,
    },
    date: { type: Date, required: true },
    slot: {
      startTime: { type: String, required: true }, // Example: "09:00 AM"
      endTime: { type: String, required: true }, // Example: "10:00 AM"
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
