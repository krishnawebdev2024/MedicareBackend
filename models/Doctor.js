// models/Doctor.js

import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "doctor" },

    image: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg?t=st=1730732566~exp=1730736166~hmac=f00212fd96ce5c96daa11d1f0acc6dadb08153181ec840f3cbe9d87d594bd4b4&w=740",
    },
  },
  { timestamps: true }
);

// Properly export the Doctor model
export default mongoose.model("Doctor", doctorSchema);
