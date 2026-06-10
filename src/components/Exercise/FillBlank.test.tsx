import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FillBlank from './FillBlank';
import type { Sentence } from '@/types';

const sentence: Sentence = {
  id: 's1',
  targetSentence: 'Das Haus ist groß.',
  translation: 'The house is big.',
  difficulty: 1,
  wordIds: ['haus'],
};

describe('FillBlank', () => {
  it('accepts a typed correct missing word', () => {
    const onResult = vi.fn();

    render(
      <FillBlank
        content={sentence}
        onResult={onResult}
        stripPunctuation={(word) => word.replace(/[.,!?;:"'()]/g, '')}
      />
    );

    expect(screen.getByText('_____ Haus ist groß.')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Type the missing word...'), {
      target: { value: 'das' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    expect(screen.getByText(/Correct! The word was/)).toBeTruthy();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 's1',
        correct: true,
        attempts: 1,
      })
    );
  });

  it('can reset after an incorrect retryable answer', () => {
    const onResult = vi.fn();

    render(<FillBlank content={sentence} onResult={onResult} />);

    fireEvent.change(screen.getByPlaceholderText('Type the missing word...'), {
      target: { value: 'Der' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(screen.getByPlaceholderText('Type the missing word...')).toHaveProperty('value', '');
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 's1',
        correct: false,
        attempts: 1,
      })
    );
  });
});
