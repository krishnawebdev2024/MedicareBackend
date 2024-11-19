import { Router } from "express";
import multer from "multer";

import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  loginDoctor,
  logoutDoctor,
  checkSession,
} from "../Controllers/doctorControllers.js";

import { verifyToken } from "../Middleware/verifyToken.js";

const upload = multer({ storage: multer.memoryStorage() });

const doctorsRouter = Router();

doctorsRouter.post(`/`, upload.single("image"), createDoctor);
doctorsRouter.post(`/login`, loginDoctor);
doctorsRouter.post(`/logout`, verifyToken, logoutDoctor);
doctorsRouter.get(`/session`, verifyToken, checkSession);
doctorsRouter.get(`/`, getDoctors);
doctorsRouter.get(`/:id`, verifyToken, getDoctorById);
doctorsRouter.put(`/:id`, verifyToken, updateDoctor);
doctorsRouter.delete(`/:id`, verifyToken, deleteDoctor);

export default doctorsRouter;
