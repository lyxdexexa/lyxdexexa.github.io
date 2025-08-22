
export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correct_answer: string | string[];
  explanation: string;
}

export interface AnswerRecord {
  question: QuizQuestion;
  selectedOptions: string[];
  isCorrect: boolean;
}

export type GameState = 'start' | 'active' | 'finished' | 'review';