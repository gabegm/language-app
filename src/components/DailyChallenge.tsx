import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '@/contexts/ProgressContext';
import { useContent } from '@/contexts/ContentContext';
import { generateDailyChallenge } from '@/engine/dailyChallengeEngine';
import { renderExercise } from '@/engine/exerciseRegistry';
import { generateEmojiGrid, parseEmojiGrid } from '@/utils/shareGenerator';
import type { DailyChallenge, ExerciseResult, Word, Sentence } from '@/types';

export default function DailyChallenge() {
  const navigate = useNavigate();
  const { dailyChallenges, addDailyChallengeResult } = useProgress();
  const { words, sentences, exercises, loaded } = useContent();

  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [completed, setCompleted] = useState(false);
  const [emojiGrid, setEmojiGrid] = useState('');

  const contentMap = useMemo(() => {
    const map = new Map<string, Word | Sentence>();
    words.forEach((w) => map.set(w.id, w));
    sentences.forEach((s) => map.set(s.id, s));
    return map;
  }, [words, sentences]);

  // Load challenge on mount
  useEffect(() => {
    if (!loaded) return;

    const today = new Date().toISOString().split('T')[0];
    const existingResult = dailyChallenges.find((d) => d.date === today);

    if (existingResult) {
      // Reconstruct results from the stored emoji grid
      const isCorrect = parseEmojiGrid(existingResult.emojiGrid);
      const reconstructedResults: ExerciseResult[] = isCorrect.map((correct, i) => ({
        exerciseId: challenge?.questions[i]?.contentId || `q${i}`,
        timestamp: new Date().toISOString(),
        correct,
        attempts: 1,
      }));

      setChallenge({
        date: today,
        questions: [],
        emojiGrid: existingResult.emojiGrid,
        completed: true,
      });
      setEmojiGrid(existingResult.emojiGrid);
      setResults(reconstructedResults);
      setCompleted(true);
    } else {
      const newChallenge = generateDailyChallenge(words, sentences, exercises, today);
      setChallenge(newChallenge);
    }
  }, [loaded, dailyChallenges, words, sentences, exercises]);

  const handleResult = useCallback(
    (result: ExerciseResult) => {
      const newResults = [...results, result];
      setResults(newResults);

      if (!challenge) return;

      if (currentQuestion < challenge.questions.length - 1) {
        // Advance to next question
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // Challenge complete
        const correct = newResults.filter((r) => r.correct).length;
        const total = newResults.length;
        const today = new Date().toISOString().split('T')[0];
        const grid = generateEmojiGrid({ date: today, correct, total, emojiGrid: '' });

        setEmojiGrid(grid);
        setCompleted(true);

        addDailyChallengeResult({
          correct,
          total,
          emojiGrid: grid,
        });
      }
    },
    [results, challenge, currentQuestion, addDailyChallengeResult]
  );

  const handleNext = useCallback(() => {
    if (!challenge) return;

    if (currentQuestion < challenge.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }, [challenge, currentQuestion]);

  const handleCopy = useCallback(async () => {
    const text = `🇩🇪 Daily Challenge: ${emojiGrid}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback handled in shareGenerator
    }
  }, [emojiGrid]);

  const stripPunctuation = useCallback((word: string) => word.replace(/[.,!?;:"'()]/g, ''), []);

  const wordList = useMemo(() => {
    return Array.from(contentMap.values()).filter(
      (v): v is Word => 'targetWord' in v
    );
  }, [contentMap]);

  if (!loaded || !challenge) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading today's challenge...</p>
      </div>
    );
  }

  // Render completed state
  if (completed) {
    const correctCount = parseEmojiGrid(emojiGrid).filter(Boolean).length;
    const totalCount = parseEmojiGrid(emojiGrid).length;

    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Today's Challenge Complete!</h2>

        <div style={styles.gridContainer}>
          <span style={styles.grid}>{emojiGrid}</span>
        </div>

        <div style={styles.stats}>
          <span style={styles.stat}>
            {correctCount} / {totalCount} correct
          </span>
        </div>

        <button style={styles.shareButton} onClick={handleCopy}>
          📋 Copy to Share
        </button>

        <button style={styles.homeButton} onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  // Render current question
  const currentQ = challenge.questions[currentQuestion];
  const content = contentMap.get(currentQ?.contentId || '');

  if (!content || !currentQ) {
    return (
      <div style={styles.container}>
        <p>Content not found.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.progress}>
        Question {currentQuestion + 1} of {challenge.questions.length}
      </div>

      <div key={content.id}>
        {renderExercise(
          currentQ.exerciseType,
          content,
          handleResult,
          wordList,
          stripPunctuation,
          handleNext,
          false // allowRetry = false for daily challenge
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 500,
    margin: '0 auto',
    padding: 20,
    textAlign: 'center',
  },
  loading: {
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  gridContainer: {
    padding: 20,
    margin: '16px 0',
  },
  grid: {
    fontSize: 32,
    letterSpacing: 4,
  },
  stats: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 20,
  },
  stat: {
    fontWeight: 600,
  },
  shareButton: {
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: 600,
    background: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    width: '100%',
    marginBottom: 12,
  },
  homeButton: {
    padding: '12px 24px',
    fontSize: 14,
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    cursor: 'pointer',
    width: '100%',
  },
  progress: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 16,
  },
};
