import { describe, it, expect } from 'vitest';
import { generateEmojiGrid, generateEmojiGridFromResults, parseEmojiGrid } from './shareGenerator';

describe('generateEmojiGrid', () => {
  it('generates all green for perfect score', () => {
    const grid = generateEmojiGrid({ date: '2026-06-08', correct: 4, total: 4, emojiGrid: '' });
    expect(grid).toBe('🟩🟩🟩🟩');
  });

  it('generates mixed emojis for partial score (greens then white)', () => {
    const grid = generateEmojiGrid({ date: '2026-06-08', correct: 3, total: 4, emojiGrid: '' });
    expect(grid).toBe('🟩🟩🟩⬜');
  });

  it('generates all white for zero score', () => {
    const grid = generateEmojiGrid({ date: '2026-06-08', correct: 0, total: 4, emojiGrid: '' });
    expect(grid).toBe('⬜⬜⬜⬜');
  });

  it('is deterministic for the same inputs', () => {
    const grid1 = generateEmojiGrid({ date: '2026-06-08', correct: 2, total: 4, emojiGrid: '' });
    const grid2 = generateEmojiGrid({ date: '2026-06-08', correct: 2, total: 4, emojiGrid: '' });
    expect(grid1).toBe(grid2);
  });

  it('returns stored emojiGrid if provided', () => {
    const stored = '🟩🟨⬜';
    const grid = generateEmojiGrid({ date: '2026-06-08', correct: 1, total: 3, emojiGrid: stored });
    expect(grid).toBe(stored);
  });

  it('handles single question', () => {
    const grid = generateEmojiGrid({ date: '2026-06-08', correct: 1, total: 1, emojiGrid: '' });
    expect(grid).toBe('🟩');
  });

  it('handles single question wrong', () => {
    const grid = generateEmojiGrid({ date: '2026-06-08', correct: 0, total: 1, emojiGrid: '' });
    expect(grid).toBe('⬜');
  });
});

describe('parseEmojiGrid', () => {
  it('parses all correct', () => {
    expect(parseEmojiGrid('🟩🟩🟩🟩')).toEqual([true, true, true, true]);
  });

  it('parses mixed results', () => {
    expect(parseEmojiGrid('🟩🟩⬜🟩⬜')).toEqual([true, true, false, true, false]);
  });

  it('parses all wrong', () => {
    expect(parseEmojiGrid('⬜⬜⬜')).toEqual([false, false, false]);
  });

  it('handles single question', () => {
    expect(parseEmojiGrid('🟩')).toEqual([true]);
    expect(parseEmojiGrid('⬜')).toEqual([false]);
  });

  it('handles empty string', () => {
    expect(parseEmojiGrid('')).toEqual([]);
  });
});

describe('generateEmojiGridFromResults', () => {
  it('preserves the order of wrong answers', () => {
    expect(generateEmojiGridFromResults([true, true, false, true, true, true])).toBe('🟩🟩⬜🟩🟩🟩');
  });
});
