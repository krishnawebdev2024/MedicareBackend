import jwt from "jsonwebtoken";
import { CustomError } from "../errorHandler.js"; // Assuming you have an error handler utility
import mongoose from "mongoose";
import Doctor from "../models/Doctor.js";

// Middleware to verify token
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    // If there's no token, return an error
    if (!token) {
      return next(new CustomError("No token provided", 401));
    }

    // Verify token and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Log the decoded token to check if the ID is correct
    // console.log("Decoded Token is here:", decoded);

    // Check if the ID in the token is valid
    const doctorId = decoded.id;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return next(new CustomError("Invalid doctor ID", 400));
    }
    console.log("dotorid from middleware doctor", doctorId);
    // Find the doctor in the database using the ID from the token
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return next(new CustomError("Doctor not found", 404));
    }

    // Attach the doctor object to the request (req)
    req.doctor = doctor;

    next();
  } catch (error) {
    next(new CustomError("Unauthorized access", 401));
  }
};
