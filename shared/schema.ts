import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Candidates table
export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  position: text("position").notNull(),
  skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
  experience: integer("experience").notNull().default(0), // years
  education: text("education"),
  resumeData: jsonb("resume_data"), // parsed resume data
  overallScore: integer("overall_score"), // 0-100
  status: text("status").notNull().default("applied"), // applied, shortlisted, interviewed, rejected, hired
  appliedDate: timestamp("applied_date").notNull().defaultNow(),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  appliedDate: true,
});

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

// Job Descriptions table
export const jobDescriptions = pgTable("job_descriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array().notNull().default(sql`'{}'::text[]`),
  fairnessScore: integer("fairness_score"), // 0-100
  biasIndicators: text("bias_indicators").array(),
  suggestions: text("suggestions").array(),
  createdDate: timestamp("created_date").notNull().defaultNow(),
});

export const insertJobDescriptionSchema = createInsertSchema(jobDescriptions).omit({
  id: true,
  createdDate: true,
  fairnessScore: true,
  biasIndicators: true,
  suggestions: true,
});

export type InsertJobDescription = z.infer<typeof insertJobDescriptionSchema>;
export type JobDescription = typeof jobDescriptions.$inferSelect;

// Interviews table
export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull(),
  candidateName: text("candidate_name").notNull(),
  position: text("position").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  meetingLink: text("meeting_link"),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  interviewData: jsonb("interview_data"), // questions asked, responses, etc.
  
  // Interview analysis scores
  confidenceScore: integer("confidence_score"), // 0-100
  communicationScore: integer("communication_score"), // 0-100
  technicalScore: integer("technical_score"), // 0-100
  problemSolvingScore: integer("problem_solving_score"), // 0-100
  overallScore: integer("overall_score"), // 0-100
  
  // Analysis details
  emotionAnalysis: jsonb("emotion_analysis"), // emotional states during interview
  pros: text("pros").array(),
  cons: text("cons").array(),
  aiRecommendation: text("ai_recommendation"),
  proctorAlerts: text("proctor_alerts").array(), // suspicious activity flags
  
  completedDate: timestamp("completed_date"),
  createdDate: timestamp("created_date").notNull().defaultNow(),
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdDate: true,
});

export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviews.$inferSelect;

// Chat messages for AI assistant
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull(), // user or assistant
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// CSV Upload history
export const csvUploads = pgTable("csv_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  candidatesCount: integer("candidates_count").notNull(),
  uploadedDate: timestamp("uploaded_date").notNull().defaultNow(),
});

export const insertCsvUploadSchema = createInsertSchema(csvUploads).omit({
  id: true,
  uploadedDate: true,
});

export type InsertCsvUpload = z.infer<typeof insertCsvUploadSchema>;
export type CsvUpload = typeof csvUploads.$inferSelect;
