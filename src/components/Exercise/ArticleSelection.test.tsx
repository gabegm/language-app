import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ArticleSelection from './ArticleSelection';
import type { Word } from '@/types';

const word: Word = {
  id: 'buch',
  targetWord: 'Buch',
  translation: 'book',
  gender: 'das',
  difficulty: 1,
  tags: [],
};

describe('ArticleSelection', () => {
  it('accepts the correct article', () => {
    const onResult = vi.fn();

    render(<ArticleSelection content={word} onResult={onResult} />);

    fireEvent.click(screen.getByRole('button', { name: 'das' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    expect(screen.getByText(/Correct! Article:/)).toBeTruthy();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 'buch',
        correct: true,
      })
    );
  });
});
