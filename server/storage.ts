import {
  type Candidate,
  type InsertCandidate,
  type Interview,
  type InsertInterview,
  type JobDescription,
  type InsertJobDescription,
  type ChatMessage,
  type InsertChatMessage,
  type CsvUpload,
  type InsertCsvUpload,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Candidates
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: string, candidate: Partial<Candidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: string): Promise<boolean>;
  
  // Interviews
  getInterviews(): Promise<Interview[]>;
  getInterview(id: string): Promise<Interview | undefined>;
  getInterviewsByCandidate(candidateId: string): Promise<Interview[]>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: string, interview: Partial<Interview>): Promise<Interview | undefined>;
  
  // Job Descriptions
  getJobDescriptions(): Promise<JobDescription[]>;
  createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription>;
  
  // Chat Messages
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(): Promise<void>;
  
  // CSV Uploads
  getCsvUploads(): Promise<CsvUpload[]>;
  createCsvUpload(upload: InsertCsvUpload): Promise<CsvUpload>;
}

export class MemStorage implements IStorage {
  private candidates: Map<string, Candidate>;
  private interviews: Map<string, Interview>;
  private jobDescriptions: Map<string, JobDescription>;
  private chatMessages: Map<string, ChatMessage>;
  private csvUploads: Map<string, CsvUpload>;

  constructor() {
    this.candidates = new Map();
    this.interviews = new Map();
    this.jobDescriptions = new Map();
    this.chatMessages = new Map();
    this.csvUploads = new Map();
  }

  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidate(id: string): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const id = randomUUID();
    const candidate: Candidate = {
      ...insertCandidate,
      id,
      appliedDate: new Date(),
    };
    this.candidates.set(id, candidate);
    return candidate;
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | undefined> {
    const candidate = this.candidates.get(id);
    if (!candidate) return undefined;

    const updated = { ...candidate, ...updates };
    this.candidates.set(id, updated);
    return updated;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    return this.candidates.delete(id);
  }

  // Interviews
  async getInterviews(): Promise<Interview[]> {
    return Array.from(this.interviews.values());
  }

  async getInterview(id: string): Promise<Interview | undefined> {
    return this.interviews.get(id);
  }

  async getInterviewsByCandidate(candidateId: string): Promise<Interview[]> {
    return Array.from(this.interviews.values()).filter(
      (interview) => interview.candidateId === candidateId
    );
  }

  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    const id = randomUUID();
    const interview: Interview = {
      ...insertInterview,
      id,
      createdDate: new Date(),
    };
    this.interviews.set(id, interview);
    return interview;
  }

  async updateInterview(id: string, updates: Partial<Interview>): Promise<Interview | undefined> {
    const interview = this.interviews.get(id);
    if (!interview) return undefined;

    const updated = { ...interview, ...updates };
    this.interviews.set(id, updated);
    return updated;
  }

  // Job Descriptions
  async getJobDescriptions(): Promise<JobDescription[]> {
    return Array.from(this.jobDescriptions.values());
  }

  async createJobDescription(insertJobDescription: InsertJobDescription): Promise<JobDescription> {
    const id = randomUUID();
    const jobDescription: JobDescription = {
      ...insertJobDescription,
      id,
      createdDate: new Date(),
    };
    this.jobDescriptions.set(id, jobDescription);
    return jobDescription;
  }

  // Chat Messages
  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async clearChatMessages(): Promise<void> {
    this.chatMessages.clear();
  }

  // CSV Uploads
  async getCsvUploads(): Promise<CsvUpload[]> {
    return Array.from(this.csvUploads.values());
  }

  async createCsvUpload(insertUpload: InsertCsvUpload): Promise<CsvUpload> {
    const id = randomUUID();
    const upload: CsvUpload = {
      ...insertUpload,
      id,
      uploadedDate: new Date(),
    };
    this.csvUploads.set(id, upload);
    return upload;
  }
}

export const storage = new MemStorage();
