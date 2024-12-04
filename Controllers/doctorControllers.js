import jwt from "jsonwebtoken";
import { bucket } from "../config/firebase.js";
import bcrypt from "bcrypt";
import Doctor from "../models/Doctor.js"; // Use the Doctor model
import { CustomError } from "../errorHandler.js";
import mongoose from "mongoose";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config.js";

// 01- Get all doctors
export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    next(new CustomError("Failed to retrieve doctors", 404));
  }
};

// 02- Get doctor by ID
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      throw new CustomError("Doctor not found", 404);
    }
    res.status(200).json(doctor);
  } catch (error) {
    next(new CustomError(error.message || "Failed to retrieve doctor", 404));
  }
};

// 03- Create a new doctor with image upload
export const createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const image = req.file;
    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl;

    if (image) {
      const blob = bucket.file(
        `images/doctors/${Date.now()}_${image.originalname}`
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
          console.log("Image URL generated:", imageUrl);

          const newDoctor = new Doctor({
            name,
            email,
            password: hashedPassword,
            role: role || "doctor",
            image: imageUrl[0],
          });

          await newDoctor.save();
          res.status(201).json(newDoctor);
        } catch (err) {
          console.error("Error saving doctor or getting URL:", err);
          next(new CustomError("Error finalizing doctor creation", 500));
        }
      });

      blobStream.end(image.buffer);
    } else {
      const newDoctor = new Doctor({
        name,
        email,
        password: hashedPassword,
        role: role || "doctor",
      });
      await newDoctor.save();
      res.status(201).json(newDoctor);
    }
  } catch (error) {
    next(new CustomError(error.message || "Failed to create doctor", 400));
  }
};

// 04- Update doctor by ID
export const updateDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoctor) {
      throw new CustomError("Doctor not found", 404);
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    next(new CustomError(error.message || "Failed to update doctor", 400));
  }
};

// 05- Delete doctor by ID
export const deleteDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;

    const deletedDoctor = await Doctor.findByIdAndDelete(doctorId);
    if (!deletedDoctor) {
      throw new CustomError("Doctor not found", 404);
    }

    res.status(204).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    next(new CustomError(error.message || "Failed to delete doctor", 400));
  }
};

// 06- Doctor Login
export const loginDoctor = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      throw new CustomError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      throw new CustomError("Invalid email or password", 401);
    }

    const token = jwt.sign(
      {
        id: doctor._id,
        name: doctor.name,
        role: doctor.role,
        email: doctor.email,
        image: doctor.image,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",

      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",

      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: "Login successful",
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        image: doctor.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 07- Doctor Logout
//export const logoutDoctor = (req, res) => {
//  res.clearCookie("token");
//  res.status(200).json({ message: "Logout successful" });
//};
export const logoutDoctor = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
};

// 08- Check Doctor Session
export const checkSession = (req, res) => {
  if (req.doctor) {
    //console.log("req.doctor from controllers", req.doctor);
    res.json({ authenticated: true, doctor: req.doctor });
  } else {
    res.json({ authenticated: false });
  }
};
