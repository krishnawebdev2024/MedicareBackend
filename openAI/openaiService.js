import axios from "axios";
import { OPENAI_API_KEY } from "../config/config.js";

// Function to interact with OpenAI API
const openaiService = async (reportData, question, isProduction = false) => {
  // Mock response when not in production mode
  if (!isProduction) {
    console.log("Dry run mode: Skipping OpenAI API call.");
    return {
      summary: "This is a mock response for testing  Bro.",
    }; // Simulate response during testing
  }

  try {
    // Ensure the API key is available
    if (!OPENAI_API_KEY) {
      throw new Error(
        "Missing OpenAI API Key. Please check your configuration."
      );
    }

    let userMessage = `Analyze the following doctor report and provide a summary`;
    if (question) {
      userMessage = question;
    }

    console.log("Processing report with OpenAI...");

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions", // Correct OpenAI endpoint for chat models
      {
        model: "gpt-3.5-turbo", // Cheapest chat model
        messages: [
          { role: "system", content: "You are a helpful assistant." }, // Instruction for the model
          {
            role: "user",
            content: `${userMessage}, What are the key health indicators I should monitor based on my Blood Report,analyze the report and also suggest me the food that I should eat and any exercise that I should do and the very important thing that i should be taking  into consideration from the report:\n\n${reportData}`,
          }, // User input
        ],
        max_tokens: 50, // Adjust based on expected response length
        temperature: 0.5, // Control randomness of the response
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`, // Authorization header with the API key
          "Content-Type": "application/json", // Content type for the request body
        },
      }
    );

    // Validate and return the formatted response
    if (response.data && response.data.choices && response.data.choices[0]) {
      return {
        summary: response.data.choices[0].message.content.trim(),
      };
    } else {
      throw new Error("Unexpected response structure from OpenAI API.");
    }
  } catch (error) {
    console.error("Error interacting with OpenAI API:", error);

    // Handle specific error cases
    if (error.response) {
      console.error("OpenAI API responded with an error:", error.response.data);
      throw new Error(
        `OpenAI API Error: ${error.response.status} - ${error.response.data.error.message}`
      );
    }

    // Handle network or other errors
    throw new Error(
      "Failed to process the report with OpenAI. Check logs for details."
    );
  }
};

export default openaiService;
