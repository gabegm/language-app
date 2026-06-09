import { useState, useCallback } from 'react';
import type { Word, Sentence, ExerciseResult } from '@/types';

interface FillBlankProps {
  content: Word | Sentence;
  onResult: (result: ExerciseResult) => void;
  onNext?: () => void;
  allowRetry?: boolean;
}

export default function FillBlank({ content, onResult, onNext, allowRetry = true }: FillBlankProps) {
  const sentence = content as Sentence;
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempts, setAttempts] = useState(0);

  const words = sentence.targetSentence.split(/\s+/);
  const blankableWords = words.filter(
    (w) => w.length > 2 && !/[.,!?;:"'()]/.test(w)
  );
  const blankWord = blankableWords[0] || words[0];
  const blankedSentence = sentence.targetSentence.replace(
    new RegExp(blankWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    '_____'
  );

  const handleSubmit = useCallback(() => {
    if (feedback) return;

    const currentAttempts = attempts;
    setAttempts((prev) => prev + 1);

    const isCorrect = input.trim().toLowerCase() === blankWord.toLowerCase();

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
  }, [feedback, input, blankWord, content.id, onResult, attempts]);

  const handleRetry = useCallback(() => {
    setInput('');
    setFeedback(null);
    setAttempts(0);
  }, []);

  return (
    <div style={styles.container}>
      <p style={styles.instruction}>Fill in the missing word:</p>

      <div style={styles.card}>
        <p style={styles.sentence}>{blankedSentence}</p>
        <p style={styles.translation}>({sentence.translation})</p>
      </div>

      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !feedback && handleSubmit()}
          placeholder="Type the missing word..."
          disabled={!!feedback}
        />
        {!feedback ? (
          <button style={styles.button} onClick={handleSubmit}>
            Check
          </button>
        ) : (
          <div style={styles.feedback}>
            {feedback === 'correct' ? (
              <span style={styles.correct}>✓ Correct! The word was "{blankWord}"</span>
            ) : (
              <span style={styles.incorrect}>
                ✗ The missing word was: <strong>{blankWord}</strong>
              </span>
            )}
            {allowRetry && feedback === 'incorrect' && (
              <button style={styles.retryButton} onClick={handleRetry}>
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
  card: {
    background: '#f0fdf4',
    border: '2px solid #2d6a4f',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  sentence: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: '#1a1a1a',
  },
  translation: {
    margin: '8px 0 0',
    color: '#6b7280',
    fontSize: 14,
  },
  inputArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    padding: '12px 16px',
    fontSize: 16,
    border: '2px solid #d1d5db',
    borderRadius: 8,
    outline: 'none',
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
  },
  feedback: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  correct: {
    color: '#2d6a4f',
    fontWeight: 600,
    fontSize: 14,
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
