import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderExercise } from './exerciseRegistry';
import type { Word } from '@/types';

const word: Word = {
  id: 'haus',
  targetWord: 'Haus',
  translation: 'house',
  difficulty: 1,
  tags: [],
};

describe('renderExercise', () => {
  it('renders a known exercise type', () => {
    render(<>{renderExercise('flashcard', word, vi.fn())}</>);

    expect(screen.getByText('Translate this:')).toBeTruthy();
    expect(screen.getByText('Haus')).toBeTruthy();
  });

  it('renders article selection and reverse flashcard exercise types', () => {
    render(
      <>
        {renderExercise('articleSelection', { ...word, gender: 'das' }, vi.fn())}
        {renderExercise('reverseFlashcard', word, vi.fn())}
      </>
    );

    expect(screen.getByText('Choose the correct article:')).toBeTruthy();
    expect(screen.getAllByText('house').length).toBeGreaterThan(0);
  });

  it('renders a fallback for unknown exercise types', () => {
    render(<>{renderExercise('mystery', word, vi.fn())}</>);

    expect(screen.getByText('Unknown exercise type: mystery')).toBeTruthy();
  });
});
