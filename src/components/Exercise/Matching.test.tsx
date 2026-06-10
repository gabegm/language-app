import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Matching from './Matching';
import type { Word } from '@/types';

const words: Word[] = [
  { id: 'haus', targetWord: 'Haus', translation: 'house', gender: 'das', difficulty: 1, tags: [] },
  { id: 'auto', targetWord: 'Auto', translation: 'car', gender: 'das', difficulty: 1, tags: [] },
];

describe('Matching', () => {
  it('reports an incorrect no-retry result only after checking all selected pairs', () => {
    const onResult = vi.fn();

    render(
      <Matching
        content={words[0]}
        words={words}
        onResult={onResult}
        allowRetry={false}
        maxPairs={2}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Haus' }));
    fireEvent.click(screen.getByRole('button', { name: 'car' }));

    expect(onResult).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    fireEvent.click(screen.getByRole('button', { name: 'house' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 'haus',
        correct: false,
        attempts: expect.any(Number),
      })
    );
  });

  it('allows tentative no-retry pairs to be deselected before checking', () => {
    const onResult = vi.fn();

    render(
      <Matching
        content={words[0]}
        words={words}
        onResult={onResult}
        allowRetry={false}
        maxPairs={2}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Haus' }));
    fireEvent.click(screen.getByRole('button', { name: 'car' }));

    expect(screen.getByText('1 / 2 pairs matched')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Haus' }));

    expect(screen.getByText('0 / 2 pairs matched')).toBeTruthy();
    expect(onResult).not.toHaveBeenCalled();
  });

  it('replaces a tentative pair instead of exposing that the old pair was wrong', () => {
    const onResult = vi.fn();

    render(
      <Matching
        content={words[0]}
        words={words}
        onResult={onResult}
        allowRetry={false}
        maxPairs={2}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    fireEvent.click(screen.getByRole('button', { name: 'house' }));

    expect(screen.getByText('1 / 2 pairs matched')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Haus' }));
    fireEvent.click(screen.getByRole('button', { name: 'house' }));

    expect(screen.getByText('1 / 2 pairs matched')).toBeTruthy();
    expect(onResult).not.toHaveBeenCalled();
  });
});
