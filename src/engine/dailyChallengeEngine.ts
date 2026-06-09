import type { DailyChallenge, Word, Sentence, Exercise } from '@/types';

/**
 * Seeded random number generator (mulberry32).
 * Same seed always produces the same sequence.
 * Returns a value in [0, 1).
 */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    const t = (seed * 15485863) | 0;
    seed = (t ^ (t >>> 19)) | 0;
    // Use absolute value to ensure non-negative output
    return Math.abs((t ^ (t >>> 8)) / 2147483647);
  };
}

/**
 * Convert a date string to a numeric seed using a proper hash.
 * Each character contributes uniquely — no collisions between different dates.
 */
function dateToSeed(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash + date.charCodeAt(i)) | 0;
  }
  return hash;
}

/**
 * Fisher-Yates shuffle using a seeded RNG.
 * Produces a uniform random permutation.
 */
function fisherYatesShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    // Clamp to [0, i] to handle rng() returning exactly 1.0
    const j = Math.min(Math.floor(rng() * (i + 1)), i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a daily challenge for a given date.
 * Uses a deterministic algorithm so everyone gets the same challenge on the same date.
 */
export function generateDailyChallenge(
  words: Word[],
  sentences: Sentence[],
  exercises: Exercise[],
  date: string
): DailyChallenge {
  const seed = dateToSeed(date);
  const rng = mulberry32(seed);

  // Combine all content into a single pool
  const allContent: Array<{ type: 'word' | 'sentence'; content: Word | Sentence }> = [
    ...words.map((w) => ({ type: 'word' as const, content: w })),
    ...sentences.map((s) => ({ type: 'sentence' as const, content: s })),
  ];

  // Shuffle deterministically using Fisher-Yates
  const shuffled = fisherYatesShuffle(allContent, rng);

  // Pick 4-6 questions (use day-of-year to vary count)
  const dayOfYear = getDayOfYear(date);
  const questionCount = 4 + (dayOfYear % 3); // 4, 5, or 6

  const selected = shuffled.slice(0, questionCount);

  // Build questions with random exercise types
  const availableTypes: Exercise['type'][] = ['flashcard', 'sentenceBuilder', 'matching', 'fillBlank'];

  const questions = selected.map(({ content }) => {
    const contentId = content.id;
    const matchingExercise = exercises.find((e) => e.contentId === contentId);

    return {
      exerciseType: matchingExercise?.type || availableTypes[Math.floor(rng() * availableTypes.length)],
      contentId,
    };
  });

  return {
    date,
    questions,
    emojiGrid: '', // Will be generated after completion
    completed: false,
  };
}

/**
 * Get day of year from a date string (UTC-consistent).
 */
function getDayOfYear(date: string): number {
  const d = new Date(date);
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const diff = d.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
}
