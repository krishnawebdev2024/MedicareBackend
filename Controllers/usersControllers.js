import jwt from "jsonwebtoken";
import { bucket } from "../config/firebase.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { CustomError } from "../errorHandler.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config.js";

// Get all users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(new CustomError("Failed to retrieve users", 404));
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    res.status(200).json(user);
  } catch (error) {
    next(new CustomError(error.message || "Failed to retrieve user", 404));
  }
};

// Create a new user with image upload
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const image = req.file;
    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl;

    if (image) {
      const blob = bucket.file(
        `images/users/${Date.now()}_${image.originalname}`
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
          const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            image: imageUrl[0],
          });
          await newUser.save();
          res.status(201).json(newUser);
        } catch (err) {
          console.error("Error saving user or getting URL:", err);
          next(new CustomError("Error finalizing user creation", 500));
        }
      });

      blobStream.end(image.buffer);
    } else {
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
      });
      await newUser.save();
      res.status(201).json(newUser);
    }
  } catch (error) {
    next(new CustomError(error.message || "Failed to create user", 400));
  }
};

// Update user by ID
export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new CustomError("User not found", 404);
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(new CustomError(error.message || "Failed to update user", 400));
  }
};

// Delete user by ID
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new CustomError("User not found", 404);
    }

    res.status(204).json({ message: "User deleted successfully" });
  } catch (error) {
    next(new CustomError(error.message || "Failed to delete user", 400));
  }
};

// User Login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new CustomError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError("Invalid email or password", 401);
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        image: user.image,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

// User Logout
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

// Check User Session
export const checkSession = (req, res) => {
  if (req.user) {
    console.log("req.user from controllers", req.user);
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
};
