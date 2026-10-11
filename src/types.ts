export interface Question {
  id: number;
  emoji?: string;
  image?: string;
  answer: string;
  poster?: string;
  difficulty: "easy" | "medium" | "hard";
  category: "hollywood" | "bollywood" | "tollywood" | "korean" | "other";
}

export interface Settings {
  timerDuration: number;
  customTimer: boolean;
  enableSounds: boolean;
  enableMusic: boolean;
  autoReveal: boolean;
  autoNext: boolean;
  shuffleQuestions: boolean;
  fullscreenOnStart: boolean;
  revealDuration: number;
}

export type Screen =
  | "loading"
  | "welcome"
  | "quiz"
  | "answer"
  | "final"
  | "admin";

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  startTime: number;
  endTime: number;
  shuffled: boolean;
}
