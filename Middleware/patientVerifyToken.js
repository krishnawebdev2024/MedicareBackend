import jwt from "jsonwebtoken";
import { CustomError } from "../errorHandler.js"; // Assuming you have an error handler utility
import mongoose from "mongoose";
import User from "../models/User.js";

// Middleware to verify token
export const patientVerifyToken = async (req, res, next) => {
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
    console.log("Decoded Token is here:", decoded);

    // Check if the ID in the token is valid
    const Id = decoded.id;
    if (!mongoose.Types.ObjectId.isValid(Id)) {
      return next(new CustomError("Invalid patient ID", 400));
    }
    console.log("Id from middlewared user", Id);
    // Find the patient in the database using the ID from the token
    const patient = await User.findById(Id);
    if (!patient) {
      return next(new CustomError("Patient not found", 404));
    }

    // Attach the patient object to the request (req)
    req.patient = patient;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    next(new CustomError("Unauthorized access", 401)); // Token is invalid or expired
  }
};
