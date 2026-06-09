import type { UserProgress } from '@/types';

const PROGRESS_KEY = 'language-progress';

function getProgressKey(language: string): string {
  return `${PROGRESS_KEY}-${language}`;
}

export function getProgress(language: string): UserProgress | null {
  try {
    const raw = localStorage.getItem(getProgressKey(language));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProgress(language: string, progress: UserProgress): void {
  try {
    localStorage.setItem(getProgressKey(language), JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export function getTodayISOString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getYesterdayISOString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}
