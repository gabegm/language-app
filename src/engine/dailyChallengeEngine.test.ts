import { describe, it, expect } from 'vitest';
import { generateDailyChallenge } from './dailyChallengeEngine';
import type { Word, Sentence, Exercise } from '@/types';

const mockWords: Word[] = [
  { id: 'w1', targetWord: 'Haus', translation: 'house', difficulty: 1, tags: [] },
  { id: 'w2', targetWord: 'Buch', translation: 'book', difficulty: 1, tags: [] },
  { id: 'w3', targetWord: 'Tisch', translation: 'table', difficulty: 1, tags: [] },
  { id: 'w4', targetWord: 'Arzt', translation: 'doctor', difficulty: 1, tags: [] },
  { id: 'w5', targetWord: 'Auto', translation: 'car', difficulty: 1, tags: [] },
];

const mockSentences: Sentence[] = [
  { id: 's1', targetSentence: 'Das Haus ist groß', translation: 'The house is big', difficulty: 1, wordIds: [] },
  { id: 's2', targetSentence: 'Das Buch liegt auf dem Tisch', translation: 'The book lies on the table', difficulty: 1, wordIds: [] },
];

const mockExercises: Exercise[] = [
  { id: 'e1', type: 'flashcard', contentId: 'w1', instructions: 'Select the correct translation' },
  { id: 'e2', type: 'sentenceBuilder', contentId: 's1', instructions: 'Arrange the words' },
  { id: 'e3', type: 'matching', contentId: 'w2', instructions: 'Match the pair' },
  { id: 'e4', type: 'fillBlank', contentId: 'w3', instructions: 'Fill in the blank' },
];

describe('generateDailyChallenge', () => {
  it('generates a deterministic challenge for the same date', () => {
    const challenge1 = generateDailyChallenge(mockWords, mockSentences, mockExercises, '2026-06-08');
    const challenge2 = generateDailyChallenge(mockWords, mockSentences, mockExercises, '2026-06-08');

    expect(challenge1.questions.length).toBe(challenge2.questions.length);
    expect(challenge1.questions.map((q) => q.contentId)).toEqual(challenge2.questions.map((q) => q.contentId));
    expect(challenge1.questions.map((q) => q.exerciseType)).toEqual(challenge2.questions.map((q) => q.exerciseType));
  });

  it('generates different challenges for different dates', () => {
    const challenge1 = generateDailyChallenge(mockWords, mockSentences, mockExercises, '2026-06-08');
    const challenge2 = generateDailyChallenge(mockWords, mockSentences, mockExercises, '2026-06-09');

    const ids1 = challenge1.questions.map((q) => q.contentId).sort().join(',');
    const ids2 = challenge2.questions.map((q) => q.contentId).sort().join(',');
    expect(ids1).not.toBe(ids2);
  });

  it('generates 4-6 questions based on day of year', () => {
    const challenge = generateDailyChallenge(mockWords, mockSentences, mockExercises, '2026-06-08');
    expect(challenge.questions.length).toBeGreaterThanOrEqual(4);
    expect(challenge.questions.length).toBeLessThanOrEqual(6);
  });

  it('includes both words and sentences in the challenge', () => {
    const challenge = generateDailyChallenge(mockWords, mockSentences, mockExercises, '2026-06-08');
    const contentIds = challenge.questions.map((q) => q.contentId);
    const hasWord = contentIds.some((id) => id.startsWith('w'));
    const hasSentence = contentIds.some((id) => id.startsWith('s'));
    expect(hasWord).toBe(true);
    expect(hasSentence).toBe(true);
  });

  it('uses matching exercise type from exercises.json when available', () => {
    const challenge = generateDailyChallenge(mockWords, mockSentences, mockExercises, '2026-06-08');
    const w1Question = challenge.questions.find((q) => q.contentId === 'w1');
    if (w1Question) {
      expect(w1Question.exerciseType).toBe('flashcard');
    }

    const s1Question = challenge.questions.find((q) => q.contentId === 's1');
    if (s1Question) {
      expect(s1Question.exerciseType).toBe('sentenceBuilder');
    }
  });

  it('returns empty questions when no content is provided', () => {
    const challenge = generateDailyChallenge([], [], [], '2026-06-08');
    expect(challenge.questions).toEqual([]);
  });

  it('handles fewer words than questions requested', () => {
    const fewWords: Word[] = [
      { id: 'w1', targetWord: 'Haus', translation: 'house', difficulty: 1, tags: [] },
      { id: 'w2', targetWord: 'Buch', translation: 'book', difficulty: 1, tags: [] },
    ];
    const challenge = generateDailyChallenge(fewWords, [], [], '2026-06-08');
    expect(challenge.questions.length).toBeLessThanOrEqual(fewWords.length);
  });

  it('produces valid question objects', () => {
    const challenge = generateDailyChallenge(mockWords, mockSentences, mockExercises, '2026-06-08');
    if (challenge.questions.length === 0) return;
    for (const q of challenge.questions) {
      expect(q).toHaveProperty('exerciseType');
      expect(q).toHaveProperty('contentId');
      expect(typeof q.contentId).toBe('string');
      if (q.exerciseType !== undefined) {
        expect(['flashcard', 'sentenceBuilder', 'matching', 'fillBlank']).toContain(q.exerciseType);
      }
    }
  });

  it('different date permutations produce different challenges (no seed collisions)', () => {
    const challenge1 = generateDailyChallenge(mockWords, mockSentences, mockExercises, '2026-06-08');
    const challenge2 = generateDailyChallenge(mockWords, mockSentences, mockExercises, '2026-08-06');
    // These dates had the same seed with the old dateToSeed (2026+6+8 = 2026+8+6)
    // With the new hash, they must produce different challenges
    const ids1 = challenge1.questions.map((q) => q.contentId).sort().join(',');
    const ids2 = challenge2.questions.map((q) => q.contentId).sort().join(',');
    expect(ids1).not.toBe(ids2);
  });
});
