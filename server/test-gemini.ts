import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export async function testGeminiConnection(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return {
        success: false,
        message: "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file."
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Simple test prompt
    const prompt = "Say 'Hello, Gemini API is working!' and nothing else.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      message: "Gemini API is working correctly!",
      data: {
        response: text,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error("Gemini API test failed:", error);
    
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: `Gemini API test failed: ${errorMessage}`
    };
  }
}

export async function testGeminiEvaluation(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return {
        success: false,
        message: "Gemini API key is not configured."
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const testSummary = "John Doe is a software engineer with 5 years of experience in JavaScript, React, and Node.js. He has worked at two startups and has experience with agile development.";

    const prompt = `
    Evaluate this candidate based on their summary and provide a JSON response with the following structure:
    {
      "overallScore": number (0-100),
      "strengths": string[],
      "weaknesses": string[],
      "recommendation": "hire" | "reject" | "interview",
      "reasoning": string
    }
    
    Candidate Summary: ${testSummary}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseError) {
      return {
        success: false,
        message: "Gemini returned invalid JSON format",
        data: { rawResponse: text }
      };
    }

    return {
      success: true,
      message: "Gemini evaluation test successful!",
      data: {
        testSummary,
        evaluation: parsedResponse,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error("Gemini evaluation test failed:", error);
    
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: `Gemini evaluation test failed: ${errorMessage}`
    };
  }
}