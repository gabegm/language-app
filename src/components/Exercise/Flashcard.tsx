import { useState, useCallback, useMemo } from 'react';
import type { Word, Sentence, ExerciseResult } from '@/types';

interface FlashcardProps {
  content: Word | Sentence;
  onResult: (result: ExerciseResult) => void;
  onNext?: () => void;
  words?: Word[];
  allowRetry?: boolean;
}

export default function Flashcard({ content, onResult, onNext, words, allowRetry = true }: FlashcardProps) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const isWord = 'translation' in content;
  const target = isWord ? (content as Word).targetWord : (content as Sentence).targetSentence;
  const answer = isWord ? (content as Word).translation : (content as Sentence).translation;

  const options = useMemo<string[]>(() => {
    if (!words || words.length === 0) return [];
    const word = content as Word;
    const wrongAnswers = words
      .filter((w) => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.translation);
    return [...wrongAnswers, word.translation].sort(() => Math.random() - 0.5);
  }, [content, words]);

  const hasOptions = options.length > 0;

  const handleSubmit = useCallback(() => {
    if (feedback) return;

    const currentAttempts = attempts;
    setAttempts((prev) => prev + 1);

    let isCorrect = false;

    if (hasOptions && selectedOption !== null) {
      const option = options[selectedOption];
      isCorrect = option.trim().toLowerCase() === answer.trim().toLowerCase();
    } else {
      isCorrect = input.trim().toLowerCase() === answer.trim().toLowerCase();
    }

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
  }, [feedback, hasOptions, selectedOption, options, input, answer, content.id, onResult, attempts]);

  const handleRetry = useCallback(() => {
    setInput('');
    setFeedback(null);
    setSelectedOption(null);
    setAttempts(0);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <p style={styles.label}>Translate this:</p>
        <h2 style={styles.target}>{target}</h2>
        {isWord && (content as Word).gender && (
          <p style={styles.gender}>({(content as Word).gender})</p>
        )}
      </div>

      <div style={styles.inputArea}>
        {hasOptions ? (
          <>
            {options.map((option, i) => (
              <button
                key={i}
                style={{
                  ...styles.optionButton,
                  ...(selectedOption === i ? styles.selectedOption : {}),
                  ...(feedback === 'correct' && option === answer ? styles.correctOption : {}),
                  ...(feedback === 'incorrect' && selectedOption === i && option !== answer ? styles.wrongOption : {}),
                }}
                onClick={() => setSelectedOption(i)}
                disabled={!!feedback}
              >
                {option}
              </button>
            ))}
            {!feedback ? (
              <button style={styles.button} onClick={handleSubmit}>
                Check
              </button>
            ) : (
              <div style={styles.feedback}>
                {feedback === 'correct' ? (
                  <span style={styles.correct}>
                    ✓ Correct! Translation: <strong>{answer}</strong>
                  </span>
                ) : (
                  <span style={styles.incorrect}>
                    ✗ The answer was: <strong>{answer}</strong>
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
          </>
        ) : (
          <>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !feedback && handleSubmit()}
              placeholder="Type the translation..."
              disabled={!!feedback}
            />
            {!feedback ? (
              <button style={styles.button} onClick={handleSubmit}>
                Check
              </button>
            ) : (
              <div style={styles.feedback}>
                {feedback === 'correct' ? (
                  <span style={styles.correct}>
                    ✓ Correct! Translation: <strong>{answer}</strong>
                  </span>
                ) : (
                  <span style={styles.incorrect}>
                    ✗ The answer was: <strong>{answer}</strong>
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
          </>
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
  card: {
    background: '#f0fdf4',
    border: '2px solid #2d6a4f',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    margin: 0,
    color: '#6b7280',
    fontSize: 14,
  },
  target: {
    margin: '8px 0 0',
    fontSize: 28,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  gender: {
    margin: '4px 0 0',
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
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
  optionButton: {
    padding: '12px 16px',
    fontSize: 15,
    background: '#f0fdf4',
    border: '2px solid #2d6a4f',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.2s',
  },
  selectedOption: {
    background: '#d1fae5',
    border: '2px solid #059669',
  },
  correctOption: {
    background: '#2d6a4f',
    color: '#fff',
    border: '2px solid #1b4332',
  },
  wrongOption: {
    background: '#fee2e2',
    border: '2px solid #dc2626',
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
