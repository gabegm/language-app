import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserProgress, ExerciseResult, DailyChallengeResult } from '@/types';
import { getProgress, saveProgress, getTodayISOString, getYesterdayISOString } from '@/stores/progressStore';

interface ProgressContextType {
  streak: number;
  dailyChallenges: DailyChallengeResult[];
  exerciseHistory: ExerciseResult[];
  refresh: () => void;
  addExerciseResult: (result: Omit<ExerciseResult, 'timestamp'>) => void;
  addDailyChallengeResult: (result: Omit<DailyChallengeResult, 'date'>) => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function ProgressProvider({ children, language }: { children: React.ReactNode; language: string }) {
  const [progress, setProgress] = useState<UserProgress | null>(() => getProgress(language));

  const refresh = useCallback(() => {
    setProgress(getProgress(language));
  }, [language]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `language-progress-${language}`) {
        setProgress(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [language]);

  const addExerciseResult = useCallback(
    (result: Omit<ExerciseResult, 'timestamp'>) => {
      setProgress((prev) => {
        const p = prev || {
          language,
          streak: 0,
          lastActiveDate: '',
          learnedWordIds: [],
          exerciseHistory: [],
          dailyChallenges: [],
        };
        const updated = {
          ...p,
          exerciseHistory: [
            ...p.exerciseHistory,
            { ...result, timestamp: new Date().toISOString() },
          ],
        };
        saveProgress(language, updated);
        return updated;
      });
    },
    [language]
  );

  const addDailyChallengeResult = useCallback(
    (result: Omit<DailyChallengeResult, 'date'>) => {
      setProgress((prev) => {
        const p = prev || {
          language,
          streak: 0,
          lastActiveDate: '',
          learnedWordIds: [],
          exerciseHistory: [],
          dailyChallenges: [],
        };
        const today = getTodayISOString();
        const yesterday = getYesterdayISOString();
        const existingIndex = p.dailyChallenges.findIndex((d) => d.date === today);

        const newResult: DailyChallengeResult = { date: today, ...result };

        let updatedChallenges: DailyChallengeResult[];
        if (existingIndex >= 0) {
          updatedChallenges = [...p.dailyChallenges];
          updatedChallenges[existingIndex] = newResult;
        } else {
          updatedChallenges = [...p.dailyChallenges, newResult];
        }

        // Update streak
        const lastResult = updatedChallenges
          .filter((d) => d.date !== today)
          .sort((a, b) => b.date.localeCompare(a.date))[0];

        let newStreak = 1;
        if (lastResult && lastResult.date === yesterday) {
          newStreak = p.streak + 1;
        } else if (lastResult && lastResult.date !== today) {
          newStreak = 1;
        }

        const updated = {
          ...p,
          streak: newStreak,
          lastActiveDate: today,
          dailyChallenges: updatedChallenges,
        };
        saveProgress(language, updated);
        return updated;
      });
    },
    [language]
  );

  const value: ProgressContextType = {
    streak: progress?.streak ?? 0,
    dailyChallenges: progress?.dailyChallenges ?? [],
    exerciseHistory: progress?.exerciseHistory ?? [],
    refresh,
    addExerciseResult,
    addDailyChallengeResult,
  };

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextType {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
