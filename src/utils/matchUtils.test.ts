import { describe, it, expect } from 'vitest';
import { shuffleArray, generateScrambled } from './matchUtils';

describe('shuffleArray', () => {
  it('returns a new array with same elements (does not mutate original)', () => {
    const arr = [1, 2, 3, 4];
    const original = [...arr];
    const shuffled = shuffleArray(arr);
    expect(shuffled).not.toBe(arr);
    expect(shuffled.sort()).toEqual(original);
    expect(arr).toEqual(original);
  });

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4];
    const shuffled = shuffleArray([...arr]);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4]);
  });

  it('works with strings', () => {
    const arr = ['a', 'b', 'c'];
    const shuffled = shuffleArray([...arr]);
    expect(shuffled.sort()).toEqual(['a', 'b', 'c']);
  });
});

describe('generateScrambled', () => {
  it('returns scrambled version of the input', () => {
    const input = 'Das Haus ist groß';
    const scrambled = generateScrambled(input);
    const words = scrambled.split(/\s+/);
    expect(words.length).toBe(input.split(/\s+/).length);
  });

  it('does not return the original order (for non-trivial inputs)', () => {
    const input = 'Das Haus ist groß';
    const scrambled = generateScrambled(input);
    const originalWords = input.split(/\s+/);
    const isSameOrder = scrambled.split(/\s+/).every((w, i) => w === originalWords[i]);
    expect(isSameOrder).toBe(false);
  });

  it('handles single word', () => {
    const input = 'Haus';
    const scrambled = generateScrambled(input);
    expect(scrambled).toBe('Haus');
  });
});
