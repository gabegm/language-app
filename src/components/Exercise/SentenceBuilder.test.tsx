import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SentenceBuilder from './SentenceBuilder';
import type { Sentence, Word } from '@/types';

const sentence: Sentence = {
  id: 's1',
  targetSentence: 'Das Haus ist groß',
  translation: 'The house is big',
  difficulty: 1,
  wordIds: ['haus'],
};

describe('SentenceBuilder', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts the words selected in sentence order', () => {
    const onResult = vi.fn();

    render(<SentenceBuilder content={sentence} onResult={onResult} />);

    for (const word of ['Das', 'Haus', 'ist', 'groß']) {
      fireEvent.click(screen.getByRole('button', { name: word }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    expect(screen.getByText('✓ Correct!')).toBeTruthy();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 's1',
        correct: true,
        attempts: 1,
      })
    );
  });

  it('can reset after an incorrect retryable sentence', () => {
    const onResult = vi.fn();

    render(<SentenceBuilder content={sentence} onResult={onResult} />);

    fireEvent.click(screen.getByRole('button', { name: 'Haus' }));
    fireEvent.click(screen.getByRole('button', { name: 'Das' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(screen.getByText('Tap words below to build your sentence...')).toBeTruthy();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 's1',
        correct: false,
        attempts: 1,
      })
    );
  });

  it('keeps selected words stable when the parent re-renders after checking', () => {
    let randomValue = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => randomValue);

    const breadSentence: Sentence = {
      id: 's4',
      targetSentence: 'Das Buch liegt auf dem Tisch',
      translation: 'The book lies on the table',
      difficulty: 1,
      wordIds: ['buch', 'tisch'],
    };
    const words: Word[] = [
      { id: 'buch', targetWord: 'Buch', translation: 'book', gender: 'das', difficulty: 1, tags: [] },
      { id: 'brot', targetWord: 'Brot', translation: 'bread', gender: 'das', difficulty: 1, tags: [] },
      { id: 'tisch', targetWord: 'Tisch', translation: 'table', gender: 'der', difficulty: 1, tags: [] },
      { id: 'stuhl', targetWord: 'Stuhl', translation: 'chair', difficulty: 1, tags: [] },
      { id: 'auto', targetWord: 'Auto', translation: 'car', difficulty: 1, tags: [] },
    ];

    function Parent() {
      const [, setRenderCount] = useState(0);
      return (
        <SentenceBuilder
          content={breadSentence}
          words={[...words]}
          onResult={() => {
            randomValue = 0.99;
            setRenderCount((count) => count + 1);
          }}
        />
      );
    }

    render(<Parent />);

    for (const word of ['Das', 'Brot', 'liegt', 'auf', 'dem', 'Tisch']) {
      fireEvent.click(screen.getByRole('button', { name: word }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    const selectedWords = screen
      .getAllByRole('button')
      .slice(0, 6)
      .map((button) => button.textContent);

    expect(selectedWords).toEqual(['Das', 'Brot', 'liegt', 'auf', 'dem', 'Tisch']);
    expect(screen.getByText('✓ Correct!')).toBeTruthy();
  });

  it('accepts same-gender noun substitutions that form a valid sentence pattern', () => {
    const onResult = vi.fn();
    const breadSentence: Sentence = {
      id: 's4',
      targetSentence: 'Das Buch liegt auf dem Tisch',
      translation: 'The book lies on the table',
      difficulty: 1,
      wordIds: ['buch', 'tisch'],
    };
    const words: Word[] = [
      { id: 'buch', targetWord: 'Buch', translation: 'book', gender: 'das', difficulty: 1, tags: [] },
      { id: 'brot', targetWord: 'Brot', translation: 'bread', gender: 'das', difficulty: 1, tags: [] },
      { id: 'tisch', targetWord: 'Tisch', translation: 'table', gender: 'der', difficulty: 1, tags: [] },
    ];

    render(<SentenceBuilder content={breadSentence} words={words} onResult={onResult} />);

    for (const word of ['Das', 'Brot', 'liegt', 'auf', 'dem', 'Tisch']) {
      fireEvent.click(screen.getByRole('button', { name: word }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));

    expect(screen.getByText('✓ Correct!')).toBeTruthy();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({
        exerciseId: 's4',
        correct: true,
      })
    );
  });
});
