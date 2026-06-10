import { useState, useCallback, useMemo } from 'react';
import type { Word, Sentence, ExerciseResult } from '@/types';

interface FillBlankProps {
  content: Word | Sentence;
  onResult: (result: ExerciseResult) => void;
  onNext?: () => void;
  words?: Word[];
  stripPunctuation?: (word: string) => string;
  allowRetry?: boolean;
}

export default function FillBlank({ content, onResult, onNext, words, stripPunctuation, allowRetry = true }: FillBlankProps) {
  const sentence = content as Sentence;
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  const sentenceWords = sentence.targetSentence.split(/\s+/).map((w) =>
    stripPunctuation ? stripPunctuation(w) : w
  );
  const blankableWords = sentenceWords.filter(
    (w) => w.length > 2 && !/[.,!?;:"'()]/.test(w)
  );
  const blankWord = blankableWords[0] || sentenceWords[0];
  const blankedSentence = sentence.targetSentence.replace(
    new RegExp(blankWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    '_____'
  );

  // Generate multiple-choice options
  const options = useMemo(() => {
    if (!words || words.length === 0) return null;
    const wrongAnswers = words
      .map((w) => stripPunctuation ? stripPunctuation(w.targetWord) : w.targetWord)
      .filter((w) => !sentenceWords.includes(w) && w.toLowerCase() !== blankWord.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const allOptions = [...wrongAnswers, blankWord].sort(() => Math.random() - 0.5);
    return allOptions;
  }, [words, sentenceWords, stripPunctuation, blankWord]);

  const hasOptions = options !== null;

  const handleSubmit = useCallback(() => {
    if (feedback) return;

    const currentAttempts = attempts;
    setAttempts((prev) => prev + 1);

    let isCorrect = false;

    if (hasOptions && selectedOption !== null) {
      isCorrect = options![selectedOption].trim().toLowerCase() === blankWord.toLowerCase();
    } else {
      isCorrect = input.trim().toLowerCase() === blankWord.toLowerCase();
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
  }, [feedback, hasOptions, selectedOption, options, input, blankWord, content.id, onResult, attempts]);

  const handleRetry = useCallback(() => {
    setInput('');
    setFeedback(null);
    setSelectedOption(null);
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
        {hasOptions ? (
          <>
            {options.map((option, i) => (
              <button
                key={i}
                style={{
                  ...styles.optionButton,
                  ...(selectedOption === i ? styles.selectedOption : {}),
                  ...(feedback === 'correct' && option === blankWord ? styles.correctOption : {}),
                  ...(feedback === 'incorrect' && selectedOption === i && option !== blankWord ? styles.wrongOption : {}),
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
          </>
        ) : (
          <>
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
