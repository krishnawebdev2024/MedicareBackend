import mongoose from "mongoose";

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    availability: [
      {
        date: { type: Date, required: true },
        slots: [
          {
            startTime: { type: String, required: true }, // Example: "09:00 AM"
            endTime: { type: String, required: true }, // Example: "10:00 AM"
            isBooked: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("DoctorAvailability", doctorAvailabilitySchema);
