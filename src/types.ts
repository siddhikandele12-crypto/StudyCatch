export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface StudySummary {
  id: string;
  title: string;
  summary: string;
  flashcards: Flashcard[];
  mindmap: MindmapNode;
  createdAt: number;
}

export interface MindmapNode {
  name: string;
  children?: MindmapNode[];
}

export interface StudyLog {
  id: string;
  startTime: number;
  duration: number; // in seconds
  type: 'focus' | 'pomodoro';
  category: string;
}

export interface UserStats {
  totalStudyTime: number;
  quizzesTaken: number;
  averageScore: number;
  streak: number;
}
