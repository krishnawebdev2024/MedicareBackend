import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import path from "path";

import { errorHandler } from "./errorHandler.js";

import usersRouter from "./Routes/usersRoutes.js";
import adminsRouter from "./Routes/adminsRoutes.js";
import doctorsRouter from "./Routes/doctorsRoutes.js";

import doctorAvailabilityRouter from "./schedule/scheduleRoutes/doctorAvailabilityRoutes.js";
import bookingRouter from "./schedule/scheduleRoutes/bookingRoutes.js";

import messageRoutes from "./message/routes/messageRoutes.js";

import apiRoutes from "./openAI/apiRoutes.js";
import fileUploadRouter from "./pdfReport/routes/fileUploadRouter.js";

import "./db.js";

import { PORT, CLIENT_URL } from "./config/config.js";

const app = express();

app.use(
  json(),
  cors({ origin: CLIENT_URL, credentials: true }),
  cookieParser()
);

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.use(`/api/v1/users`, usersRouter);
app.use(`/api/v1/admins`, adminsRouter);
app.use(`/api/v1/doctors`, doctorsRouter);
app.use(`/api/v1/doctorAvailability`, doctorAvailabilityRouter);
app.use(`/api/v1/bookings`, bookingRouter);
app.use(`/api/v1/messages`, messageRoutes);
app.use(`/api/v1/openAI`, apiRoutes);
app.use(`/api/v1/fileUpload`, fileUploadRouter);

//app.get("*", (req, res) => {
//  res.status(404).json({ message: "page not found!buddy" });
//});

// Catch-All Route for React App (SPA - Single Page Application)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
