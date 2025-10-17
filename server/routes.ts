import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseCSV } from "./lib/csv-parser";
import { sendEmail, generateInterviewEmail } from "./lib/email";
import {
  chatWithAI,
  analyzeBias,
  generateInterviewQuestions,
  analyzeInterviewPerformance,
  analyzeSentiment,
} from "./lib/openai";

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Candidates endpoints
  app.get("/api/candidates", async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });

  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const candidate = await storage.getCandidate(req.params.id);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candidate" });
    }
  });

  app.post("/api/candidates", async (req, res) => {
    try {
      const candidate = await storage.createCandidate(req.body);
      res.status(201).json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Failed to create candidate" });
    }
  });

  app.patch("/api/candidates/:id", async (req, res) => {
    try {
      const candidate = await storage.updateCandidate(req.params.id, req.body);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Failed to update candidate" });
    }
  });

  app.delete("/api/candidates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCandidate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Candidate not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete candidate" });
    }
  });

  // CSV Upload endpoint
  app.post("/api/candidates/upload-csv", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const csvContent = req.file.buffer.toString("utf-8");
      const parsedCandidates = parseCSV(csvContent);

      // Create candidates with AI-generated scores
      const createdCandidates = [];
      for (const parsedCandidate of parsedCandidates) {
        // Generate a score based on experience and skills
        const baseScore = Math.min(50 + parsedCandidate.experience * 5 + parsedCandidate.skills.length * 3, 100);
        const randomVariation = Math.floor(Math.random() * 20 - 10);
        const overallScore = Math.max(0, Math.min(100, baseScore + randomVariation));

        const candidate = await storage.createCandidate({
          ...parsedCandidate,
          overallScore,
          status: "applied",
        });
        createdCandidates.push(candidate);
      }

      // Record the upload
      await storage.createCsvUpload({
        filename: req.file.originalname,
        candidatesCount: createdCandidates.length,
      });

      res.json({
        message: "Candidates uploaded successfully",
        count: createdCandidates.length,
        candidates: createdCandidates,
      });
    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).json({ error: "Failed to upload CSV" });
    }
  });

  // Job Descriptions endpoints
  app.get("/api/job-descriptions", async (req, res) => {
    try {
      const jobDescriptions = await storage.getJobDescriptions();
      res.json(jobDescriptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job descriptions" });
    }
  });

  app.post("/api/job-descriptions/analyze-bias", async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ error: "Description is required" });
      }

      // Analyze bias using OpenAI
      const analysis = await analyzeBias(description);

      // Save the job description with analysis
      const jobDescription = await storage.createJobDescription({
        title: "Analyzed Job Description",
        description,
        requirements: [],
        fairnessScore: analysis.fairnessScore,
        biasIndicators: analysis.biasIndicators,
        suggestions: analysis.suggestions,
      });

      res.json(jobDescription);
    } catch (error) {
      console.error("Bias analysis error:", error);
      res.status(500).json({ error: "Failed to analyze bias" });
    }
  });

  // Interviews endpoints
  app.get("/api/interviews", async (req, res) => {
    try {
      const interviews = await storage.getInterviews();
      res.json(interviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interviews" });
    }
  });

  app.get("/api/interviews/:id", async (req, res) => {
    try {
      const interview = await storage.getInterview(req.params.id);
      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }
      res.json(interview);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interview" });
    }
  });

  app.post("/api/interviews/schedule", async (req, res) => {
    try {
      const { candidateId, scheduledDate } = req.body;
      
      const candidate = await storage.getCandidate(candidateId);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Generate a meeting link (simulated)
      const meetingId = Math.random().toString(36).substring(7);
      const meetingLink = `https://meet.google.com/${meetingId}`;

      // Create interview
      const interview = await storage.createInterview({
        candidateId: candidate.id,
        candidateName: candidate.name,
        position: candidate.position,
        scheduledDate: new Date(scheduledDate),
        meetingLink,
        status: "scheduled",
        interviewData: null,
        confidenceScore: null,
        communicationScore: null,
        technicalScore: null,
        problemSolvingScore: null,
        overallScore: null,
        emotionAnalysis: null,
        pros: null,
        cons: null,
        aiRecommendation: null,
        proctorAlerts: null,
        completedDate: null,
      });

      // Send email notification (simulated)
      const emailOptions = generateInterviewEmail(
        candidate.name,
        candidate.position,
        meetingLink,
        new Date(scheduledDate)
      );
      emailOptions.to = candidate.email;
      await sendEmail(emailOptions);

      res.status(201).json(interview);
    } catch (error) {
      console.error("Interview scheduling error:", error);
      res.status(500).json({ error: "Failed to schedule interview" });
    }
  });

  app.post("/api/interviews/:id/start", async (req, res) => {
    try {
      const interview = await storage.getInterview(req.params.id);
      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      // Generate initial questions
      const candidate = await storage.getCandidate(interview.candidateId);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      const questions = await generateInterviewQuestions(
        candidate.name,
        candidate.position,
        candidate.skills
      );

      const updated = await storage.updateInterview(req.params.id, {
        status: "in_progress",
        interviewData: { questions, responses: [] },
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to start interview" });
    }
  });

  app.post("/api/interviews/:id/complete", async (req, res) => {
    try {
      const { responses } = req.body;
      const interview = await storage.getInterview(req.params.id);
      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      // Analyze performance using OpenAI
      const analysis = await analyzeInterviewPerformance(
        interview.candidateName,
        interview.position,
        responses || []
      );

      // Simulate proctor alerts (random for demo)
      const proctorAlerts: string[] = [];
      if (Math.random() > 0.7) {
        proctorAlerts.push("Multiple faces detected at 00:15:30");
      }
      if (Math.random() > 0.8) {
        proctorAlerts.push("Background noise detected at 00:22:15");
      }

      const updated = await storage.updateInterview(req.params.id, {
        status: "completed",
        completedDate: new Date(),
        confidenceScore: analysis.confidenceScore,
        communicationScore: analysis.communicationScore,
        technicalScore: analysis.technicalScore,
        problemSolvingScore: analysis.problemSolvingScore,
        overallScore: analysis.overallScore,
        pros: analysis.pros,
        cons: analysis.cons,
        aiRecommendation: analysis.aiRecommendation,
        proctorAlerts: proctorAlerts.length > 0 ? proctorAlerts : null,
      });

      // Update candidate overall score
      await storage.updateCandidate(interview.candidateId, {
        overallScore: analysis.overallScore,
        status: "interviewed",
      });

      res.json(updated);
    } catch (error) {
      console.error("Interview completion error:", error);
      res.status(500).json({ error: "Failed to complete interview" });
    }
  });

  // Chat endpoints
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      // Save user message
      await storage.createChatMessage({
        role: "user",
        content,
      });

      // Get conversation history
      const messages = await storage.getChatMessages();
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add system context
      const systemMessage = {
        role: "system",
        content: "You are a helpful AI recruitment assistant. Help recruiters with scheduling interviews, analyzing candidates, and answering questions about the recruitment process. Be concise and professional.",
      };

      // Get AI response
      const aiResponse = await chatWithAI([systemMessage, ...conversationHistory]);

      // Save AI message
      const assistantMessage = await storage.createChatMessage({
        role: "assistant",
        content: aiResponse,
      });

      res.json(assistantMessage);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.delete("/api/chat/messages", async (req, res) => {
    try {
      await storage.clearChatMessages();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  // CSV uploads history
  app.get("/api/csv-uploads", async (req, res) => {
    try {
      const uploads = await storage.getCsvUploads();
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch uploads" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
