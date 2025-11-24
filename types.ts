export interface BookSection {
  title: string;
  content: string; // Markdown supported
}

export interface BookChapter {
  title: string;
  sections: BookSection[];
}

export interface BookStructure {
  title: string;
  subtitle: string;
  author: string;
  abstract: string;
  language: string;
  chapters: BookChapter[];
  references: string[];
}

export interface GenerationParams {
  topic: string;
  authorName: string;
  madzhab: string; // e.g., Shafi'i, Hanafi, Comparative
  targetAudience: string; // e.g., Academic, General, Students
  includeMultimedia: boolean;
  pageCount: number;
  referenceCount: number;
  language: string;
}

export enum AppState {
  IDLE,
  GENERATING,
  VIEWING,
  ERROR
}