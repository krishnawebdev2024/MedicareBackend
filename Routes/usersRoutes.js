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
} from "../Controllers/usersControllers.js";
import { patientVerifyToken } from "../Middleware/patientVerifyToken.js";

const upload = multer({ storage: multer.memoryStorage() });

const usersRouter = Router();

usersRouter.post(`/`, upload.single("image"), createUser);
usersRouter.post(`/login`, loginUser);
usersRouter.post(`/logout`, patientVerifyToken, logoutUser);
usersRouter.get(`/session`, patientVerifyToken, checkSession);
usersRouter.get(`/`, patientVerifyToken, getUsers);
usersRouter.get(`/:id`, patientVerifyToken, getUserById);
usersRouter.put(`/:id`, patientVerifyToken, updateUser);
usersRouter.delete(`/:id`, patientVerifyToken, deleteUser);

export default usersRouter;
