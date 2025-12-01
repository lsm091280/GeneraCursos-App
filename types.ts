
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  explanation: string; // Feedback shown after answering
}

export interface Section {
  id: string; // e.g., "1.1"
  title: string;
  isGenerated: boolean;
  content?: string; // HTML content
  imagePrompt?: string; // Prompt used for the image
  imageUrl?: string; // Final URL
  quiz?: QuizQuestion[]; // New: Quiz per section
  isQuizGenerated: boolean;
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  sections: Section[];
  quiz?: QuizQuestion[]; // Global Chapter Quiz
  isQuizGenerated: boolean;
}

export interface Course {
  topic: string;
  targetAudience: string;
  title: string;
  chapters: Chapter[];
  globalSummary?: string;
  resources?: string; // New: Recommended resources
}

export enum AppStep {
  API_KEY = -1, // New Step for Key Entry
  INPUT = 0,
  PLAYER = 1
}

export interface DownloadState {
  isDownloading: boolean;
  logs: { type: 'info' | 'success' | 'warn' | 'error', text: string }[];
  progress: number; // 0 to 100
}
