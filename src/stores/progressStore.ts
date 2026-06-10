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

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayISOString(): string {
  return getLocalDateString();
}

export function getYesterdayISOString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}
