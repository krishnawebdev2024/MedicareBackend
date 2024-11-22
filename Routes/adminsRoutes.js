import { Router } from "express";
import multer from "multer";

import {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  logoutAdmin,
  checkSession,
} from "../Controllers/adminControllers.js";
import { adminVerifyToken } from "../Middleware/AdminVerifyToken.js";

const upload = multer({ storage: multer.memoryStorage() });

const adminsRouter = Router();

adminsRouter.post(`/`, upload.single("image"), createAdmin);
adminsRouter.post(`/login`, loginAdmin);
adminsRouter.post(`/logout`, adminVerifyToken, logoutAdmin);
adminsRouter.get(`/session`, adminVerifyToken, checkSession);
adminsRouter.get(`/`, getAdmins);
adminsRouter.get(`/:id`, getAdminById);
adminsRouter.put(`/:id`, updateAdmin);
adminsRouter.delete(`/:id`, deleteAdmin);

export default adminsRouter;
