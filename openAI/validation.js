// This function will validate the structure of the report data.
export const validateReportData = (reportData) => {
  if (
    !reportData ||
    typeof reportData !== "string" ||
    reportData.trim().length === 0
  ) {
    return {
      isValid: false,
      message: "Report data must be a non-empty string",
    };
  }

  // Additional validation rules can be added as needed (e.g., checking for certain keywords or structure)
  return { isValid: true, message: "" };
};
