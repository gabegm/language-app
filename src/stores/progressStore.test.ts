import { beforeEach, describe, expect, it } from 'vitest';
import {
  getLocalDateString,
  getProgress,
  getTodayISOString,
  getYesterdayISOString,
  saveProgress,
} from './progressStore';
import type { UserProgress } from '@/types';

function installLocalStorage() {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      clear: () => values.clear(),
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    },
    configurable: true,
  });
}

describe('getLocalDateString', () => {
  beforeEach(() => {
    installLocalStorage();
    localStorage.clear();
  });

  it('uses the local calendar date instead of the UTC date', () => {
    const localHalfPastMidnight = new Date(2026, 5, 10, 0, 30);

    expect(getLocalDateString(localHalfPastMidnight)).toBe('2026-06-10');
  });

  it('saves and loads progress by language', () => {
    const progress: UserProgress = {
      language: 'de',
      streak: 2,
      lastActiveDate: '2026-06-10',
      learnedWordIds: ['haus'],
      exerciseHistory: [],
      dailyChallenges: [],
    };

    saveProgress('de', progress);

    expect(getProgress('de')).toEqual(progress);
    expect(getProgress('fr')).toBeNull();
  });

  it('returns null for malformed stored progress', () => {
    localStorage.setItem('language-progress-de', '{not-json');

    expect(getProgress('de')).toBeNull();
  });

  it('formats today and yesterday as local date strings', () => {
    const today = getTodayISOString();
    const yesterday = getYesterdayISOString();

    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
