
export enum QuizCategory {
  EXPLORE = 'EXPLORE',
  ARTIST = 'ARTIST'
}

export enum QuizMode {
  TRIVIA = 'TRIVIA',
  LYRICS = 'LYRICS'
}

export enum QuestionFormat {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  WRITTEN = 'WRITTEN'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
}

export interface QuizConfig {
  categoryType: QuizCategory;
  mode: QuizMode;
  genre?: string;
  decade?: string;
  artist?: string;
  questionCount: number;
  format: QuestionFormat;
  difficulty: Difficulty;
}

export interface User {
  username: string;
  password?: string;
  permanentPoints: number;
}

export interface UserState {
  currentUser: User | null;
}
