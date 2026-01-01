import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseCSV } from "./lib/csv-parser";
import { parsePDFResume } from "./lib/pdf-parser";
import { sendEmail, generateInterviewEmail } from "./lib/email";
import { googleCalendarService } from "./lib/google-calendar";
import { addTestRoutes } from "./test-routes";
import {
  chatWithAI,
  analyzeBias,
  generateInterviewQuestions,
  analyzeInterviewPerformance,
} from "./lib/openai";
import { Router } from "express";
import { evaluateCandidate } from "./geminiService";

const router = Router();

router.post("/api/evaluate", async (req, res) => {
  const { summary } = req.body;
  try {
    const aiResult = await evaluateCandidate(summary);
    res.json(JSON.parse(aiResult));
  } catch (err) {
    console.error("Evaluate error:", err);
    res.status(500).json({ error: "Failed to evaluate candidate", details: err instanceof Error ? err.message : String(err) });
  }
});

// Configure multer for file uploads with size limits
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Add test routes for debugging
  addTestRoutes(app);
  
  // Register the evaluate route
  app.use(router);
  
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

      console.log("CSV upload received:", {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      const csvContent = req.file.buffer.toString("utf-8");
      console.log("CSV content preview:", csvContent.substring(0, 200));

      const parsedCandidates = parseCSV(csvContent);
      console.log("Parsed candidates count:", parsedCandidates.length);
      if (parsedCandidates.length > 0) {
        console.log("First parsed candidate:", parsedCandidates[0]);
      }

      // Create candidates with AI-generated scores
      const createdCandidates = [];
      for (const parsedCandidate of parsedCandidates) {
        let overallScore = 50; // Default score
        
        try {
          // Create a comprehensive summary for AI evaluation
          const candidateSummary = `
            Name: ${parsedCandidate.name}
            Position: ${parsedCandidate.position}
            Experience: ${parsedCandidate.experience} years
            Skills: ${parsedCandidate.skills.join(', ')}
            Email: ${parsedCandidate.email}
          `;
          
          // Use AI to evaluate the candidate
          const aiEvaluation = await evaluateCandidate(candidateSummary);
          const evaluation = JSON.parse(aiEvaluation);
          overallScore = evaluation.overallScore || 50;
        } catch (error) {
          console.error(`AI evaluation failed for ${parsedCandidate.name}:`, error);
          // Fallback to improved manual scoring
          const experienceScore = Math.min(parsedCandidate.experience * 8, 40);
          const skillsScore = Math.min(parsedCandidate.skills.length * 4, 30);
          const positionBonus = parsedCandidate.position.toLowerCase().includes('senior') ? 10 : 0;
          const randomFactor = Math.floor(Math.random() * 21) - 10; // -10 to +10
          overallScore = Math.max(20, Math.min(95, 30 + experienceScore + skillsScore + positionBonus + randomFactor));
        }

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
      });

      res.json(jobDescription);
    } catch (error) {
      console.error("Bias analysis error:", error);
      res.status(500).json({ error: "Failed to analyze bias" });
    }
  });

  // Bias analysis with file upload
  app.post("/api/job-descriptions/analyze-bias-file", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Analyze bias using the file buffer (supports PDF)
      const analysis = await analyzeBias(req.file.buffer);

      res.json(analysis);
    } catch (error) {
      console.error("File bias analysis error:", error);
      res.status(500).json({ error: "Failed to analyze file for bias" });
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

      // Create Google Calendar event with Google Meet
      const calendarEvent = await googleCalendarService.createMeetingEvent(
        candidate.name,
        candidate.email,
        candidate.position,
        new Date(scheduledDate),
        60 // 60 minutes duration
      );

      // Create interview with calendar event details
      const interview = await storage.createInterview({
        candidateId: candidate.id,
        candidateName: candidate.name,
        position: candidate.position,
        scheduledDate: new Date(scheduledDate),
        meetingLink: calendarEvent.meetLink,
        status: "scheduled",
        interviewData: {
          calendarEventId: calendarEvent.eventId,
          calendarLink: calendarEvent.calendarLink
        },
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

      // Send email notification with calendar details
      const emailOptions = generateInterviewEmail(
        candidate.name,
        candidate.position,
        calendarEvent.meetLink,
        new Date(scheduledDate)
      );
      emailOptions.to = candidate.email;
      await sendEmail(emailOptions);

      res.status(201).json({
        ...interview,
        calendarLink: calendarEvent.calendarLink
      });
    } catch (error) {
      console.error("Interview scheduling error:", error);
      res.status(500).json({ error: "Failed to schedule interview" });
    }
  });

  app.post("/api/interviews/:id/join", async (req, res) => {
    try {
      const interview = await storage.getInterview(req.params.id);
      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      // Update interview status to in_progress
      const updated = await storage.updateInterview(req.params.id, {
        status: "in_progress",
      });

      // Return the meeting URL
      res.json({
        meetUrl: interview.meetingLink,
        interview: updated
      });
    } catch (error) {
      console.error("Interview join error:", error);
      res.status(500).json({ error: "Failed to join interview" });
    }
  });

  app.post("/api/interviews/:id/analyze", async (req, res) => {
    try {
      const interview = await storage.getInterview(req.params.id);
      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      // Get candidate information
      const candidate = await storage.getCandidate(interview.candidateId);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Generate mock responses for analysis (simulating interview responses)
      const mockResponses = [
        `I have ${candidate.experience} years of experience in ${candidate.position}.`,
        `My key skills include ${candidate.skills.join(', ')}.`,
        `I solved a complex problem by implementing a new system that improved efficiency by 30%.`
      ];

      // Analyze performance using AI
      const analysis = await analyzeInterviewPerformance(
        candidate.name,
        candidate.position,
        mockResponses
      );

      // Simulate proctor alerts (random for demo)
      const proctorAlerts: string[] = [];
      if (Math.random() > 0.7) {
        proctorAlerts.push("Multiple faces detected at 00:15:30");
      }
      if (Math.random() > 0.8) {
        proctorAlerts.push("Background noise detected at 00:22:15");
      }

      // Complete the interview with analysis
      const updated = await storage.updateInterview(req.params.id, {
        status: "completed",
        completedDate: new Date(),
        interviewData: {
          questions: ["Tell me about your experience", "What are your key skills?", "Describe a challenge you solved"],
          responses: mockResponses
        },
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
      console.error("Interview analysis error:", error);
      res.status(500).json({ error: "Failed to analyze interview" });
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

  // Google Calendar OAuth routes
  app.get("/api/auth/google/status", (req, res) => {
    res.json({
      configured: googleCalendarService.isGoogleCalendarConfigured(),
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing'
    });
  });

  app.get("/api/auth/google", (req, res) => {
    try {
      if (!googleCalendarService.isGoogleCalendarConfigured()) {
        return res.status(400).json({ 
          error: "Google Calendar API not configured",
          message: "Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables"
        });
      }
      const authUrl = googleCalendarService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error('Google auth URL error:', error);
      res.status(500).json({ error: "Failed to generate auth URL", details: error.message });
    }
  });

  app.post("/api/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.body;
      const tokens = await googleCalendarService.getAccessToken(code);
      
      // In production, store these tokens securely
      res.json({ 
        message: "Google Calendar connected successfully",
        tokens: {
          access_token: tokens.access_token.substring(0, 10) + "...",
          refresh_token: tokens.refresh_token ? "Present" : "Not provided"
        }
      });
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.status(500).json({ error: "Failed to authenticate with Google" });
    }
  });

  // PDF Resume Upload endpoint - SIMPLIFIED VERSION
  app.post("/api/candidates/upload-pdf", (req, res, next) => {
    console.log('PDF upload request headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    next();
  }, upload.single("file"), async (req, res) => {
    try {
      console.log("PDF upload attempt:", {
        hasFile: !!req.file,
        mimetype: req.file?.mimetype,
        size: req.file?.size,
        filename: req.file?.originalname
      });

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ 
          error: "Only PDF files are allowed",
          received: req.file.mimetype 
        });
      }

      console.log("Starting PDF parsing using parsePDFResume...");
      try {
        const parsed = await parsePDFResume(req.file.buffer);
        console.log('Parsed PDF resume:', parsed);

        // Create candidate using parsed data with AI evaluation
        let overallScore = 50; // Default score
        
        try {
          // Create a comprehensive summary for AI evaluation
          const candidateSummary = `
            Name: ${parsed.name}
            Position: ${parsed.position || "Not specified"}
            Experience: ${parsed.experience || 0} years
            Skills: ${(parsed.skills || []).join(', ')}
            Email: ${parsed.email}
          `;
          
          // Use AI to evaluate the candidate
          const aiEvaluation = await evaluateCandidate(candidateSummary);
          const evaluation = JSON.parse(aiEvaluation);
          overallScore = evaluation.overallScore || 50;
        } catch (error) {
          console.error(`AI evaluation failed for ${parsed.name}:`, error);
          // Fallback to improved manual scoring
          const experienceScore = Math.min((parsed.experience || 0) * 8, 40);
          const skillsScore = Math.min((parsed.skills?.length || 0) * 4, 30);
          const positionBonus = (parsed.position || '').toLowerCase().includes('senior') ? 10 : 0;
          const randomFactor = Math.floor(Math.random() * 21) - 10; // -10 to +10
          overallScore = Math.max(20, Math.min(95, 30 + experienceScore + skillsScore + positionBonus + randomFactor));
        }
        
        const candidate = await storage.createCandidate({
          name: parsed.name,
          email: parsed.email,
          position: parsed.position || "Not specified",
          skills: parsed.skills || [],
          experience: parsed.experience || 0,
          overallScore,
          status: "applied",
          resumeData: { filename: req.file.originalname, uploadType: "pdf", parsed },
        });

        console.log("Candidate created successfully:", candidate.id);

        res.json({
          message: "Resume uploaded and processed successfully",
          candidate,
          parsedResume: parsed,
        });
      } catch (pdfError) {
        console.error('PDF parsing failed:', pdfError);
        res.status(500).json({ 
          error: "PDF parsing failed",
          details: pdfError instanceof Error ? pdfError.message : "Unknown PDF error"
        });
      }
    } catch (error) {
      console.error("PDF upload error:", error);
      res.status(500).json({ 
        error: "Failed to process PDF resume",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
