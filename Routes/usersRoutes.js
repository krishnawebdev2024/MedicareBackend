import { Router } from "express";
import multer from "multer";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
  checkSession,
  uploadPDF,
} from "../Controllers/usersControllers.js";
import { patientVerifyToken } from "../Middleware/patientVerifyToken.js";

const upload = multer({ storage: multer.memoryStorage() });

const usersRouter = Router();

usersRouter.post(`/`, upload.single("image"), createUser);
usersRouter.post(`/login`, loginUser);
usersRouter.post(`/logout`, patientVerifyToken, logoutUser);
usersRouter.get(`/session`, patientVerifyToken, checkSession);
usersRouter.get(`/`, getUsers);
usersRouter.get(`/:id`, getUserById);
usersRouter.put(`/:id`, updateUser);
usersRouter.delete(`/:id`, deleteUser);
usersRouter.post(`/upload-pdf`, uploadPDF);

export default usersRouter;
