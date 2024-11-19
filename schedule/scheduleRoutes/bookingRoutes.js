// routes/bookingRoutes.js
import { Router } from "express";
import {
  createBooking,
  updateBookingStatus,
  getBookingsByDoctor,
  getBookingsByPatient,
  deleteBooking,
} from "../scheduleControllers/bookingControllers.js";

const bookingRouter = Router();

// Create a new booking
bookingRouter.post("/", createBooking);

// Update booking status (for admin or doctor to confirm/cancel)
bookingRouter.put("/:id", updateBookingStatus);

// Get all bookings for a specific doctor
bookingRouter.get("/doctor/:id", getBookingsByDoctor);

// Get all bookings for a specific patient
bookingRouter.get("/patient/:id", getBookingsByPatient);

// Delete booking by ID
bookingRouter.delete("/:id", deleteBooking);

export default bookingRouter;
