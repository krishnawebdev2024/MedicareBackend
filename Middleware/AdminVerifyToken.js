import jwt from "jsonwebtoken";
import { CustomError } from "../errorHandler.js";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

export const adminVerifyToken = async (req, res, next) => {
  try {
    // Get the token from cookies
    const token = req.cookies.token;

    // Check if a token is provided
    if (!token) {
      return next(new CustomError("No token provided", 401));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract admin ID from the token
    const adminId = decoded.id;

    // Validate the admin ID format
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return next(new CustomError("Invalid admin ID", 400));
    }

    // Find the admin in the database
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return next(new CustomError("Admin not found", 404));
    }

    // Attach the admin to the request object
    req.admin = admin;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("AdminVerifyToken Error:", error);
    next(new CustomError("Unauthorized access", 401)); // Handle invalid/expired tokens
  }
};
