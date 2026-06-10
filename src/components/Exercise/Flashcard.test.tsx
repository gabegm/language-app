import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Flashcard from './Flashcard';
import type { Word } from '@/types';

const word: Word = {
  id: 'haus',
  targetWord: 'Haus',
  translation: 'house',
  gender: 'das',
  difficulty: 1,
  tags: [],
};

describe('Flashcard', () => {
  it('accepts a typed correct translation', () => {
    const onResult = vi.fn();

    render(<Flashcard content={word} onResult={onResult} />);

    fireEvent.change(screen.getByPlaceholderText('Type the translation...'), {
      target: { value: 'House' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    expect(screen.getByText(/Correct! Translation:/)).toBeTruthy();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 'haus',
        correct: true,
        attempts: 1,
      })
    );
  });

  it('shows the next-question action after an incorrect no-retry answer', () => {
    const onResult = vi.fn();
    const onNext = vi.fn();

    render(
      <Flashcard
        content={word}
        onResult={onResult}
        onNext={onNext}
        allowRetry={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Type the translation...'), {
      target: { value: 'roof' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next Question →' }));

    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 'haus',
        correct: false,
        attempts: 1,
      })
    );
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
