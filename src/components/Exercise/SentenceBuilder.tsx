import { useState, useCallback, useMemo } from 'react';
import type { Word, Sentence, ExerciseResult } from '@/types';

interface SentenceBuilderProps {
  content: Word | Sentence;
  onResult: (result: ExerciseResult) => void;
  onNext?: () => void;
  stripPunctuation?: (word: string) => string;
  allowRetry?: boolean;
}

export default function SentenceBuilder({ content, onResult, onNext, stripPunctuation, allowRetry = true }: SentenceBuilderProps) {
  const sentence = content as Sentence;
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempts, setAttempts] = useState(0);

  const targetWords = sentence.targetSentence.split(/\s+/).map((w) =>
    stripPunctuation ? stripPunctuation(w) : w
  );

  const scrambled = useMemo(() => {
    const shuffled = [...targetWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [targetWords]);

  const handleSelect = useCallback(
    (word: string) => {
      if (feedback) return;

      setSelected((prev) => {
        if (prev.includes(word)) {
          return prev.filter((w) => w !== word);
        }
        return [...prev, word];
      });
    },
    [feedback]
  );

  const handleSubmit = useCallback(() => {
    if (feedback) return;

    const currentAttempts = attempts;
    setAttempts((prev) => prev + 1);

    const isCorrect = selected.join(' ') === targetWords.join(' ');

    if (isCorrect) {
      setFeedback('correct');
      onResult({
        exerciseId: content.id,
        correct: true,
        attempts: currentAttempts + 1,
        timestamp: new Date().toISOString(),
      });
    } else {
      setFeedback('incorrect');
      onResult({
        exerciseId: content.id,
        correct: false,
        attempts: currentAttempts + 1,
        timestamp: new Date().toISOString(),
      });
    }
  }, [feedback, selected, sentence.targetSentence, content.id, onResult, attempts]);

  const handleReset = useCallback(() => {
    setSelected([]);
    setFeedback(null);
    setAttempts(0);
  }, []);

  return (
    <div style={styles.container}>
      <p style={styles.instruction}>Arrange the words to form the correct sentence:</p>

      <div style={styles.answerArea}>
        {selected.length === 0 ? (
          <p style={styles.placeholder}>Tap words below to build your sentence...</p>
        ) : (
          <div style={styles.wordsRow}>
            {selected.map((word, i) => (
              <button
                key={`${word}-${i}`}
                style={styles.wordChip}
                onClick={() => handleSelect(word)}
                disabled={!!feedback}
              >
                {word}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.sourceArea}>
        {scrambled.map((word, i) => (
          <button
            key={`${word}-${i}`}
            style={{
              ...styles.wordChip,
              ...(selected.includes(word) ? styles.wordChipDisabled : {}),
            }}
            onClick={() => handleSelect(word)}
            disabled={!!feedback || selected.includes(word)}
          >
            {word}
          </button>
        ))}
      </div>

      {!feedback ? (
        <button style={styles.button} onClick={handleSubmit} disabled={selected.length === 0}>
          Check
        </button>
      ) : (
        <div style={styles.feedback}>
          {feedback === 'correct' ? (
            <span style={styles.correct}>✓ Correct!</span>
          ) : (
            <span style={styles.incorrect}>
              ✗ Correct answer: <strong>{sentence.targetSentence}</strong>
            </span>
          )}
          {allowRetry && feedback === 'incorrect' && (
            <button style={styles.retryButton} onClick={handleReset}>
              Try Again
            </button>
          )}
          {!allowRetry && onNext && (
            <button style={styles.nextButton} onClick={onNext}>
              Next Question →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 500,
    margin: '0 auto',
    padding: 20,
  },
  instruction: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 16,
  },
  answerArea: {
    minHeight: 60,
    background: '#f9fafb',
    border: '2px dashed #d1d5db',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  placeholder: {
    color: '#9ca3af',
    textAlign: 'center',
  },
  wordsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  sourceArea: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  wordChip: {
    padding: '8px 14px',
    fontSize: 15,
    background: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  wordChipDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
  button: {
    padding: '12px 24px',
    fontSize: 16,
    fontWeight: 600,
    background: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    width: '100%',
  },
  feedback: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  correct: {
    color: '#2d6a4f',
    fontWeight: 600,
    fontSize: 16,
  },
  incorrect: {
    color: '#dc2626',
    fontSize: 14,
  },
  retryButton: {
    padding: '8px 16px',
    fontSize: 14,
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    cursor: 'pointer',
  },
  nextButton: {
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 600,
    background: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    width: '100%',
  },
};
