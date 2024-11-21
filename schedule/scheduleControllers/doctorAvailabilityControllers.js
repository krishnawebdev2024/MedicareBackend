import DoctorAvailability from "../scheduleModels/DoctorAvailability.js";
import { CustomError } from "../../errorHandler.js";

// 1. Create a new availability slot
export const createAvailability = async (req, res, next) => {
  try {
    const { doctorId, date, slots } = req.body;

    // Validate if the necessary fields are provided
    if (!doctorId || !date || !slots || slots.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create new availability object using the provided data
    const newAvailability = new DoctorAvailability({
      doctorId,
      availability: [
        {
          date: new Date(date), // Convert the date to a Date object
          slots: slots.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: false, // Default to false for each slot
          })),
        },
      ],
    });

    // Save the new availability to the database
    await newAvailability.save();

    // Respond with success
    res.status(201).json({
      message: "Availability created successfully",
      newAvailability,
    });
  } catch (error) {
    next(
      new CustomError(error.message || "Failed to create availability", 500)
    );
  }
};

// 2. Get availability for a specific doctor
export const getAvailabilityByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    // Find availability for the specified doctor
    const availability = await DoctorAvailability.find({ doctorId });
    if (!availability.length) {
      throw new CustomError("No availability found for this doctor", 404);
    }

    res.status(200).json(availability);
  } catch (error) {
    next(
      new CustomError(error.message || "Failed to retrieve availability", 500)
    );
  }
};

// 3. Update an availability slot

export const updateAvailability = async (req, res) => {
  const { id } = req.params; // This is the doctor availability document _id
  const { availability } = req.body; // The data you want to update (date and slots)

  try {
    // Find the doctor availability document by ID
    const doctorAvailability = await DoctorAvailability.findById(id);
    if (!doctorAvailability) {
      return res.status(404).json({ message: "Doctor availability not found" });
    }

    // Loop through the availability array and update the date and slots
    let updated = false; // Flag to track if any update is performed

    // Loop through the availability array
    availability.forEach((newAvailability) => {
      // Check if the date exists in the current availability
      const existingAvailability = doctorAvailability.availability.find(
        (a) => a.date.toISOString() === newAvailability.date
      );

      if (existingAvailability) {
        // Loop through the slots and find the correct slot to update
        newAvailability.slots.forEach((newSlot) => {
          const slotToUpdate = existingAvailability.slots.find(
            (slot) => slot._id.toString() === newSlot._id
          );

          if (slotToUpdate) {
            // Update the slot, respecting the default value of isBooked
            slotToUpdate.startTime = newSlot.startTime;
            slotToUpdate.endTime = newSlot.endTime;

            // Only update isBooked if it's provided
            if (newSlot.hasOwnProperty("isBooked")) {
              slotToUpdate.isBooked = newSlot.isBooked;
            }

            console.log(`Slot updated: ${slotToUpdate._id}`);
            updated = true; // Mark that an update happened
          } else {
            console.log(`Slot not found: ${newSlot._id}`);
          }
        });
      } else {
        console.log(`Availability for date ${newAvailability.date} not found`);
      }
    });

    if (updated) {
      // Save the updated doctor availability
      await doctorAvailability.save();
      console.log("Doctor availability updated successfully");
      return res
        .status(200)
        .json({ message: "Doctor availability updated successfully" });
    } else {
      console.log("No updates made to availability");
      return res.status(400).json({ message: "No updates were made" });
    }
  } catch (error) {
    console.error("Error updating doctor availability:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 4. Delete an availability slot
export const deleteAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the availability by ID and delete it
    const deletedAvailability = await DoctorAvailability.findByIdAndDelete(id);
    if (!deletedAvailability) {
      throw new CustomError("Availability not found", 404);
    }

    res.status(200).json({ message: "Availability deleted successfully" });
  } catch (error) {
    next(
      new CustomError(error.message || "Failed to delete availability", 500)
    );
  }
};

// 5. Create  Delete a particular availability slot
export const deleteSlot = async (req, res, next) => {
  try {
    const { availabilityId, slotId } = req.params; // The availability document _id and the slot _id

    // Find the availability document by ID
    const doctorAvailability = await DoctorAvailability.findById(
      availabilityId
    );
    if (!doctorAvailability) {
      return res.status(404).json({ message: "Doctor availability not found" });
    }

    // Find and remove the slot from the availability document
    const updatedAvailability = doctorAvailability.availability.map(
      (availability) => {
        if (availability.slots) {
          availability.slots = availability.slots.filter(
            (slot) => slot._id.toString() !== slotId
          );
        }
        return availability;
      }
    );

    // Save the updated availability document
    doctorAvailability.availability = updatedAvailability;
    await doctorAvailability.save();

    return res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    next(new CustomError(error.message || "Failed to delete the slot", 500));
  }
};
