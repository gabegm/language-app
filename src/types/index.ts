// Content types (stored in IndexedDB)

export interface LanguageDeck {
  id: string;
  name: string;
  words: Word[];
  sentences: Sentence[];
  exercises: Exercise[];
}

export interface Word {
  id: string;
  targetWord: string;
  translation: string;
  gender?: string;
  exampleSentence?: string;
  difficulty: number;
  tags: string[];
}

export interface Sentence {
  id: string;
  targetSentence: string;
  translation: string;
  difficulty: number;
  wordIds: string[];
}

export interface Exercise {
  id: string;
  type: 'flashcard' | 'sentenceBuilder' | 'matching' | 'fillBlank';
  contentId: string;
  instructions: string;
}

// Progress types (stored in localStorage)

export interface UserProgress {
  language: string;
  streak: number;
  lastActiveDate: string;
  learnedWordIds: string[];
  exerciseHistory: ExerciseResult[];
  dailyChallenges: DailyChallengeResult[];
}

export interface ExerciseResult {
  exerciseId: string;
  timestamp: string;
  correct: boolean;
  attempts: number;
}

export interface DailyChallengeResult {
  date: string;
  correct: number;
  total: number;
  emojiGrid: string;
}

// Daily challenge types

export interface DailyChallenge {
  date: string;
  questions: {
    exerciseType: string;
    contentId: string;
  }[];
  emojiGrid: string;
  completed: boolean;
}
