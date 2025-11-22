// Shared TypeScript types for Resume Screening System

export interface Resume {
  id: string;
  text: string;
  fileName: string;
  uploadedAt: Date;
  parsed: ParsedResume;
  embedding?: number[];
}

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export interface Experience {
  title?: string;
  company?: string;
  duration?: string;
  description?: string;
}

export interface Education {
  degree?: string;
  institution?: string;
  year?: string;
}

export interface JobDescription {
  id: string;
  text: string;
  fileName: string;
  uploadedAt: Date;
  embedding?: number[];
}

export interface MatchScore {
  score: number; // 0-100
  strengths: string[];
  gaps: string[];
  insights: string[];
  resumeId: string;
  jobDescriptionId: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  resumeId?: string;
  jobDescriptionId?: string;
  messages: ChatMessage[];
  context?: string[];
}

export interface UploadResponse {
  success: boolean;
  id: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}
