import jwt from "jsonwebtoken";
import { bucket } from "../config/firebase.js";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.js"; // Use the Admin model
import { CustomError } from "../errorHandler.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config.js";

// Get all admins
export const getAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    next(new CustomError("Failed to retrieve admins", 404));
  }
};

// Get admin by ID
export const getAdminById = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      throw new CustomError("Admin not found", 404);
    }
    res.status(200).json(admin);
  } catch (error) {
    next(new CustomError(error.message || "Failed to retrieve admin", 404));
  }
};

// Create a new admin with image upload
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const image = req.file;
    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl;

    if (image) {
      const blob = bucket.file(
        `images/admins/${Date.now()}_${image.originalname}`
      );
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: image.mimetype,
        },
      });

      blobStream.on("error", (err) => {
        next(new CustomError("Image upload failed", 500));
      });

      blobStream.on("finish", async () => {
        try {
          imageUrl = await blob.getSignedUrl({
            action: "read",
            expires: "03-01-2500",
          });

          const newAdmin = new Admin({
            name,
            email,
            password: hashedPassword,
            role: role || "admin", // Default to admin if no role is provided
            image: imageUrl[0], // Store the image URL
          });

          await newAdmin.save();
          res.status(201).json(newAdmin);
        } catch (err) {
          console.error("Error saving admin or getting URL:", err);
          next(new CustomError("Error finalizing admin creation", 500));
        }
      });

      blobStream.end(image.buffer);
    } else {
      const newAdmin = new Admin({
        name,
        email,
        password: hashedPassword,
        role: role || "admin", // Default to admin if no role is provided
      });
      await newAdmin.save();
      res.status(201).json(newAdmin);
    }
  } catch (error) {
    next(new CustomError(error.message || "Failed to create admin", 400));
  }
};

// Update admin by ID
export const updateAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.id;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedAdmin) {
      throw new CustomError("Admin not found", 404);
    }

    res.status(200).json(updatedAdmin);
  } catch (error) {
    next(new CustomError(error.message || "Failed to update admin", 400));
  }
};

// Delete admin by ID
export const deleteAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.id;

    const deletedAdmin = await Admin.findByIdAndDelete(adminId);
    if (!deletedAdmin) {
      throw new CustomError("Admin not found", 404);
    }

    res.status(204).json({ message: "Admin deleted successfully" });
  } catch (error) {
    next(new CustomError(error.message || "Failed to delete admin", 400));
  }
};

// Admin Login
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      throw new CustomError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new CustomError("Invalid email or password", 401);
    }

    const token = jwt.sign(
      {
        id: admin._id,
        name: admin.name,
        role: admin.role,
        email: admin.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Logout
export const logoutAdmin = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

// Check Admin Session
export const checkSession = (req, res) => {
  if (req.admin) {
    res.json({ authenticated: true, admin: req.admin });
  } else {
    res.json({ authenticated: false });
  }
};
