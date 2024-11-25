import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./errorHandler.js";

import usersRouter from "./Routes/usersRoutes.js";
import adminsRouter from "./Routes/adminsRoutes.js";
import doctorsRouter from "./Routes/doctorsRoutes.js";

import doctorAvailabilityRouter from "./schedule/scheduleRoutes/doctorAvailabilityRoutes.js";
import bookingRouter from "./schedule/scheduleRoutes/bookingRoutes.js";

import messageRoutes from "./message/routes/messageRoutes.js";

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

app.get("*", (req, res) => {
  res.status(404).json({ message: "page not found!" });
});

app.use(errorHandler);
app.listen(PORT, () => {
  //console.log(`Server is running on port: ${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
});
