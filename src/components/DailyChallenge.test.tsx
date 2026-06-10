import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DailyChallenge from './DailyChallenge';
import { getLocalDateString } from '@/stores/progressStore';
import type { Exercise, LanguageDeck, Sentence, Word } from '@/types';

const mockState = vi.hoisted(() => ({
  content: {
    words: [] as Word[],
    sentences: [] as Sentence[],
    exercises: [] as Exercise[],
    loaded: true,
  },
  progress: {
    dailyChallenges: [] as Array<{ date: string; correct: number; total: number; emojiGrid: string }>,
    addDailyChallengeResult: vi.fn(),
  },
}));

vi.mock('@/contexts/ContentContext', () => ({
  useContent: () => mockState.content,
}));

vi.mock('@/contexts/ProgressContext', () => ({
  useProgress: () => mockState.progress,
}));

const words: Word[] = [
  { id: 'haus', targetWord: 'Haus', translation: 'house', difficulty: 1, tags: [] },
  { id: 'buch', targetWord: 'Buch', translation: 'book', difficulty: 1, tags: [] },
  { id: 'auto', targetWord: 'Auto', translation: 'car', difficulty: 1, tags: [] },
  { id: 'tag', targetWord: 'Tag', translation: 'day', difficulty: 1, tags: [] },
];

const sentences: Sentence[] = [
  {
    id: 's1',
    targetSentence: 'Das Haus ist groß',
    translation: 'The house is big',
    difficulty: 1,
    wordIds: ['haus'],
  },
];

const exercises: Exercise[] = [
  { id: 'e1', type: 'flashcard', contentId: 'haus', instructions: 'Translate Haus' },
  { id: 'e2', type: 'flashcard', contentId: 'buch', instructions: 'Translate Buch' },
  { id: 'e3', type: 'flashcard', contentId: 'auto', instructions: 'Translate Auto' },
  { id: 'e4', type: 'flashcard', contentId: 'tag', instructions: 'Translate Tag' },
  { id: 'e5', type: 'sentenceBuilder', contentId: 's1', instructions: 'Arrange sentence' },
];

const deck: LanguageDeck = {
  id: 'de',
  name: 'German',
  words,
  sentences,
  exercises,
};

describe('DailyChallenge', () => {
  beforeEach(() => {
    mockState.content.words = deck.words;
    mockState.content.sentences = deck.sentences;
    mockState.content.exercises = deck.exercises;
    mockState.content.loaded = true;
    mockState.progress.addDailyChallengeResult.mockClear();
    mockState.progress.dailyChallenges = [];
  });

  it('shows question breakdown for an already completed daily challenge', async () => {
    mockState.progress.dailyChallenges = [
      {
        date: getLocalDateString(),
        correct: 1,
        total: 4,
        emojiGrid: '🟩⬜⬜⬜',
      },
    ];

    render(
      <MemoryRouter>
        <DailyChallenge />
      </MemoryRouter>
    );

    await screen.findByText("Today's Challenge Complete!");

    await waitFor(() => {
      expect(screen.getAllByText(/\[flashcard\]|\[sentenceBuilder\]/).length).toBeGreaterThan(0);
    });
  });

  it('shows correct feedback before completing the daily challenge', async () => {
    mockState.content.words = [words[0]];
    mockState.content.sentences = [];
    mockState.content.exercises = [exercises[0]];

    render(
      <MemoryRouter>
        <DailyChallenge />
      </MemoryRouter>
    );

    await screen.findByText('Question 1 of 1');

    fireEvent.click(screen.getByRole('button', { name: 'house' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    expect(screen.getByText(/Correct! Translation:/)).toBeTruthy();
    expect(screen.queryByText("Today's Challenge Complete!")).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Next Question →' }));

    expect(await screen.findByText("Today's Challenge Complete!")).toBeTruthy();
    expect(mockState.progress.addDailyChallengeResult).toHaveBeenCalledWith({
      correct: 1,
      total: 1,
      emojiGrid: '🟩',
    });
  });

  it('does not replace the current question after the user starts answering', async () => {
    const articleWords: Word[] = [
      { id: 'kuche', targetWord: 'Küche', translation: 'kitchen', gender: 'die', difficulty: 1, tags: [] },
      { id: 'katze', targetWord: 'Katze', translation: 'cat', gender: 'die', difficulty: 1, tags: [] },
    ];
    mockState.content.words = articleWords;
    mockState.content.sentences = [];
    mockState.content.exercises = [
      { id: 'e-kuche', type: 'articleSelection', contentId: 'kuche', instructions: 'Choose article' },
      { id: 'e-katze', type: 'articleSelection', contentId: 'katze', instructions: 'Choose article' },
    ];

    const { rerender } = render(
      <MemoryRouter>
        <DailyChallenge />
      </MemoryRouter>
    );

    await screen.findByText('Question 1 of 2');
    const initialTarget = screen.getByRole('heading', { level: 2 }).textContent;

    fireEvent.click(screen.getByRole('button', { name: 'die' }));

    mockState.content.words = [...articleWords].reverse();
    rerender(
      <MemoryRouter>
        <DailyChallenge />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(initialTarget);
    });
  });
});
