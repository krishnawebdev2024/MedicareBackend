import express from "express";
import { upload, extractTextFromPDF } from "../controllers/pdfController.js";

const fileUploadRouter = express.Router();

// Handle file upload and text extraction
fileUploadRouter.post("/upload", upload.single("pdf"), extractTextFromPDF);

export default fileUploadRouter;
