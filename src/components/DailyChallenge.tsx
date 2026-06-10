import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '@/contexts/ProgressContext';
import { useContent } from '@/contexts/ContentContext';
import { generateDailyChallenge } from '@/engine/dailyChallengeEngine';
import { renderExercise } from '@/engine/exerciseRegistry';
import { generateEmojiGridFromResults, parseEmojiGrid } from '@/utils/shareGenerator';
import { getLocalDateString } from '@/stores/progressStore';
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

  // Initialize the challenge for the current date. Once a user starts a daily
  // challenge, keep that question list stable across provider refreshes.
  useEffect(() => {
    if (!loaded) return;

    const today = getLocalDateString();
    if (challenge?.date === today) return;

    const existingResult = dailyChallenges.find((d) => d.date === today);

    if (existingResult) {
      const completedChallenge = generateDailyChallenge(words, sentences, exercises, today);
      // Reconstruct results from the stored emoji grid
      const isCorrect = parseEmojiGrid(existingResult.emojiGrid);
      const reconstructedResults: ExerciseResult[] = isCorrect.map((correct, i) => ({
        exerciseId: completedChallenge.questions[i]?.contentId || `q${i}`,
        timestamp: new Date().toISOString(),
        correct,
        attempts: 1,
      }));

      setChallenge({
        ...completedChallenge,
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
  }, [loaded, challenge?.date, dailyChallenges, words, sentences, exercises]);

  const handleResult = useCallback(
    (result: ExerciseResult) => {
      setResults((prev) => {
        const next = [...prev];
        next[currentQuestion] = result;
        return next;
      });
    },
    [currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (!challenge) return;

    if (currentQuestion < challenge.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      return;
    }

    const orderedResults = results.map((result) => result.correct);
    const correct = orderedResults.filter(Boolean).length;
    const total = results.length;
    const grid = generateEmojiGridFromResults(orderedResults);

    setEmojiGrid(grid);
    setCompleted(true);

    addDailyChallengeResult({
      correct,
      total,
      emojiGrid: grid,
    });
  }, [challenge, currentQuestion, results, addDailyChallengeResult]);

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

        {/* Detailed breakdown */}
        <div style={styles.breakdown}>
          <h3 style={styles.breakdownTitle}>Question Breakdown</h3>
          {challenge.questions.map((q, i) => {
            const result = results[i];
            const content = contentMap.get(q.contentId);
            const isCorrect = result?.correct ?? false;
            const isWord = content && 'targetWord' in content;
            const target = isWord
              ? (content as Word).targetWord
              : (content as Sentence).targetSentence;
            const translation = isWord
              ? (content as Word).translation
              : (content as Sentence).translation;

            return (
              <div
                key={q.contentId}
                style={{
                  ...styles.breakdownItem,
                  borderLeft: isCorrect ? '4px solid #2d6a4f' : '4px solid #dc2626',
                }}
              >
                <span style={styles.breakdownIcon}>
                  {isCorrect ? '✓' : '✗'}
                </span>
                <span style={styles.breakdownTarget}>{target}</span>
                <span style={styles.breakdownTranslation}>({translation})</span>
                <span style={styles.breakdownType}>
                  [{q.exerciseType}]
                </span>
              </div>
            );
          })}
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

      <div key={`${currentQuestion}-${currentQ.exerciseType}-${content.id}`}>
        {renderExercise(
          currentQ.exerciseType,
          content,
          handleResult,
          wordList,
          stripPunctuation,
          handleNext,
          false, // allowRetry = false for daily challenge
          currentQ.exerciseType === 'matching' ? 5 : undefined // cap matching to 5 pairs
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
  breakdown: {
    textAlign: 'left',
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 0,
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    marginBottom: 8,
    background: '#f9fafb',
    borderRadius: 6,
    fontSize: 14,
  },
  breakdownIcon: {
    fontSize: 16,
    fontWeight: 700,
    width: 20,
    textAlign: 'center',
  },
  breakdownTarget: {
    fontWeight: 600,
    color: '#1a1a1a',
  },
  breakdownTranslation: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  breakdownType: {
    fontSize: 11,
    color: '#9ca3af',
    marginLeft: 'auto',
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
