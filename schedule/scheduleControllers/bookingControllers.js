import Booking from "../scheduleModels/Booking.js";
import DoctorAvailability from "../scheduleModels/DoctorAvailability.js";
import { CustomError } from "../../errorHandler.js";

// Check if the selected slot is available
const checkSlotAvailability = async (doctorId, date, startTime, endTime) => {
  // Find the doctor's availability for the given date
  const availability = await DoctorAvailability.findOne({
    doctorId,
    "availability.date": new Date(date), // Match the exact date
  });

  if (availability) {
    // Find the specific slot within the availability array
    const slot = availability.availability
      .find(
        (entry) =>
          new Date(entry.date).toDateString() === new Date(date).toDateString()
      )
      ?.slots.find((s) => s.startTime === startTime && s.endTime === endTime);

    // Check if the slot exists and if it's booked
    if (slot && slot.isBooked) {
      return false; // Slot is already booked
    }
    return true; // Slot is available
  }
  return false; // No availability found for this doctor on this date
};

// 01- Create a new booking
export const createBooking = async (req, res, next) => {
  try {
    const { doctorId, patientId, date, slot } = req.body;

    // Step 1: Check if the slot is available
    const isSlotAvailable = await checkSlotAvailability(
      doctorId,
      date,
      slot.startTime,
      slot.endTime
    );

    if (!isSlotAvailable) {
      throw new CustomError("Slot is already booked or unavailable", 400);
    }

    // Step 2: Create a new booking if the slot is available
    const newBooking = new Booking({
      doctorId,
      patientId,
      date,
      slot,
      status: "pending", // Default status is "pending"
    });

    // Step 3: Update the availability to mark the slot as booked
    await DoctorAvailability.updateOne(
      { doctorId, "availability.date": new Date(date) },
      {
        $set: {
          "availability.$.slots.$[slot].isBooked": true, // Mark the slot as booked
        },
      },
      {
        arrayFilters: [
          { "slot.startTime": slot.startTime, "slot.endTime": slot.endTime },
        ],
      }
    );

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    next(new CustomError(error.message || "Failed to create booking", 400));
  }
};

// 02- Update booking status
export const updateBookingStatus = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      throw new CustomError("Invalid status", 400);
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      throw new CustomError("Booking not found", 404);
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    next(new CustomError(error.message || "Failed to update booking", 400));
  }
};

// 03- Get all bookings for a specific doctor
export const getBookingsByDoctor = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const bookings = await Booking.find({ doctorId }).populate(
      "patientId",
      "name email"
    ); // populate patient details

    if (!bookings || bookings.length === 0) {
      throw new CustomError("No bookings found for this doctor", 404);
    }

    res.status(200).json(bookings);
  } catch (error) {
    next(new CustomError(error.message || "Failed to retrieve bookings", 400));
  }
};

// 04- Get all bookings for a specific patient
export const getBookingsByPatient = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const bookings = await Booking.find({ patientId }).populate(
      "doctorId",
      "name email"
    ); // populate doctor details

    if (!bookings || bookings.length === 0) {
      throw new CustomError("No bookings found for this patient", 404);
    }

    res.status(200).json(bookings);
  } catch (error) {
    next(new CustomError(error.message || "Failed to retrieve bookings", 400));
  }
};

// 05- Get all bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("doctorId", "name email") // Populate doctor details
      .populate("patientId", "name email"); // Populate patient details

    if (!bookings || bookings.length === 0) {
      throw new CustomError("No bookings found", 404);
    }

    res.status(200).json(bookings);
  } catch (error) {
    next(
      new CustomError(error.message || "Failed to retrieve all bookings", 400)
    );
  }
};

// 06- Delete booking by ID
export const deleteBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;

    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    if (!deletedBooking) {
      throw new CustomError("Booking not found", 404);
    }

    // Step 4: Free the slot when the booking is deleted
    await DoctorAvailability.updateOne(
      {
        doctorId: deletedBooking.doctorId,
        "availability.date": deletedBooking.date,
      },
      {
        $set: {
          "availability.$.slots.$[slot].isBooked": false, // Mark the slot as available
        },
      },
      {
        arrayFilters: [
          {
            "slot.startTime": deletedBooking.slot.startTime,
            "slot.endTime": deletedBooking.slot.endTime,
          },
        ],
      }
    );

    res.status(204).json({ message: "Booking deleted successfully" });
  } catch (error) {
    next(new CustomError(error.message || "Failed to delete booking", 400));
  }
};
