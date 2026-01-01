import type { Express } from "express";
import multer from "multer";
import { testGeminiConnection, testGeminiEvaluation } from "./test-gemini";

const upload = multer({ storage: multer.memoryStorage() });

export function addTestRoutes(app: Express) {
  // Gemini API connection test
  app.get("/api/test-gemini", async (req, res) => {
    try {
      const result = await testGeminiConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Test endpoint failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Gemini evaluation test
  app.get("/api/test-gemini-evaluation", async (req, res) => {
    try {
      const result = await testGeminiEvaluation();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Evaluation test endpoint failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Environment check
  app.get("/api/test-env", (req, res) => {
    res.json({
      geminiKeyPresent: !!process.env.GEMINI_API_KEY,
      geminiKeyValid: process.env.GEMINI_API_KEY !== "your-gemini-api-key-here",
      openaiKeyPresent: !!process.env.OPENAI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT
    });
  });
  // Simple test endpoint for PDF upload without AI processing
  app.post("/api/test-pdf", upload.single("file"), async (req, res) => {
    try {
      console.log("Test PDF upload:", {
        hasFile: !!req.file,
        mimetype: req.file?.mimetype,
        size: req.file?.size,
        filename: req.file?.originalname
      });

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Try basic PDF parsing without AI
      try {
        const pdf = await import('pdf-parse');
        const data = await pdf.default(req.file.buffer);
        
        res.json({
          success: true,
          text: data.text.substring(0, 500) + "...",
          pages: data.numpages,
          info: data.info
        });
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        res.status(500).json({ 
          error: "PDF parsing failed", 
          details: pdfError instanceof Error ? pdfError.message : "Unknown error"
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        error: "Upload failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}