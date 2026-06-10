import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ReverseFlashcard from './ReverseFlashcard';
import type { Word } from '@/types';

const word: Word = {
  id: 'brot',
  targetWord: 'Brot',
  translation: 'bread',
  difficulty: 1,
  tags: [],
};

describe('ReverseFlashcard', () => {
  it('accepts the correct German word for an English prompt', () => {
    const onResult = vi.fn();

    render(<ReverseFlashcard content={word} onResult={onResult} />);

    fireEvent.change(screen.getByPlaceholderText('Type the German word...'), {
      target: { value: 'brot' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    expect(screen.getByText(/Correct! Word:/)).toBeTruthy();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 'brot',
        correct: true,
      })
    );
  });
});
