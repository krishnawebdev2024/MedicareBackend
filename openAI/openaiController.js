import openaiService from "./openaiService.js";
import { validateReportData } from "./validation.js";

const processReport = async (req, res) => {
  const { reportData, question } = req.body;
  // const { reportData } = req.body;

  // Validate the incoming report data
  const validationResult = validateReportData(reportData);
  if (!validationResult.isValid) {
    return res.status(400).json({ error: validationResult.message });
  }

  try {
    // Call the OpenAI service to process the report
    const result = await openaiService(reportData, question);
    // const result = await openaiService(reportData);
    return res.status(200).json({ summary: result });
  } catch (error) {
    return res.status(500).json({ error: "Failed to process the report" });
  }
};

export default {
  processReport,
};
