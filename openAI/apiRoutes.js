import express from "express";
import openaiController from "./openaiController.js";

const apiRouter = express.Router();

// Define route for processing the report
apiRouter.post("/processReport", openaiController.processReport);

export default apiRouter;
