import { Router } from "express";
import {
  createAvailability,
  getAvailabilityByDoctor,
  updateAvailability,
  deleteAvailability,
  deleteSlot,
} from "../scheduleControllers/doctorAvailabilityControllers.js";

const doctorAvailabilityRouter = Router();

// POST: Create availability
doctorAvailabilityRouter.post("/", createAvailability);

// GET: Get availability for a specific doctor
doctorAvailabilityRouter.get("/:doctorId", getAvailabilityByDoctor);

// PUT: Update availability
doctorAvailabilityRouter.put("/:id", updateAvailability);

// DELETE: Delete availability
doctorAvailabilityRouter.delete("/:id", deleteAvailability);

// DELETE: Delete a specific slot within an availability
doctorAvailabilityRouter.delete("/:availabilityId/slot/:slotId", deleteSlot);

export default doctorAvailabilityRouter;
