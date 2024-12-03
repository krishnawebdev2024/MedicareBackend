import fs from "fs";
import multer from "multer";
import path from "path";
import PDFParser from "pdf2json"; // Import pdf2json
import openaiService from "../../openAI/openaiService.js";

const uploadDirectory =
  "/Users/radhakrishnansivapalan/Desktop/createUserServer/pdfReport/controllers/uploads";

// Ensure the uploads folder exists
if (!fs.existsSync(uploadDirectory)) {
  console.log("Uploads directory does not exist. Creating it...");
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Set up the storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Function to extract text from PDF using pdf2json
const extractTextFromPDF = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const question = req.body.question;
    const filePath = path.join(uploadDirectory, req.file.filename);
    console.log("Resolved file path:", filePath);

    if (!fs.existsSync(filePath)) {
      return res
        .status(400)
        .json({ message: "File not found at the specified path" });
    }

    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("Error parsing PDF:", errData.parserError);
      res.status(500).json({ message: "Error extracting text from PDF" });
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const reportData = pdfData.Pages.map((page) => {
        return page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(
          " "
        );
      }).join("\n");

      //console.log("Extracted text:", reportData);

      // Delete the file after processing
      fs.unlinkSync(filePath);

      //openaiService(reportData, question).then((AIOutcome) =>
      //  res.status(200).json({ AIOutcome })
      //);
      // console.log(x);
      // res.status(200).json({ extractedText });

      openaiService(reportData, question)
        .then((AIOutcome) => res.status(200).json({ AIOutcome }))
        .catch((error) => {
          console.error("Error calling OpenAI service:", error);
          res.status(500).json({
            message: `Error processing the text with OpenAI: ${error.message}`,
          });
        });
    });

    // Load the PDF into pdfParser
    pdfParser.loadPDF(filePath);
  } catch (error) {
    console.error("Error processing the file:", error);
    res.status(500).json({ message: "Error extracting text from PDF" });
  }
};

export { upload, extractTextFromPDF };
