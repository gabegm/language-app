import { useState, useCallback, useMemo } from 'react';
import type { Word, Sentence, ExerciseResult } from '@/types';

interface SentenceBuilderProps {
  content: Word | Sentence;
  onResult: (result: ExerciseResult) => void;
  onNext?: () => void;
  words?: Word[];
  stripPunctuation?: (word: string) => string;
  allowRetry?: boolean;
}

function normalizeWord(word: string): string {
  return word.toLocaleLowerCase('de-DE');
}

function isValidSentenceSelection(selectedWords: string[], targetWords: string[], words?: Word[]): boolean {
  if (selectedWords.length !== targetWords.length) return false;

  const exactMatch = selectedWords.every((word, index) => normalizeWord(word) === normalizeWord(targetWords[index]));
  if (exactMatch) return true;

  const wordByTarget = new Map((words ?? []).map((word) => [normalizeWord(word.targetWord), word]));

  return selectedWords.every((word, index) => {
    const targetWord = targetWords[index];
    if (normalizeWord(word) === normalizeWord(targetWord)) return true;

    const selectedEntry = wordByTarget.get(normalizeWord(word));
    const targetEntry = wordByTarget.get(normalizeWord(targetWord));

    return Boolean(
      selectedEntry?.gender &&
      targetEntry?.gender &&
      selectedEntry.gender === targetEntry.gender
    );
  });
}

export default function SentenceBuilder({ content, onResult, onNext, words, stripPunctuation, allowRetry = true }: SentenceBuilderProps) {
  const sentence = content as Sentence;
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempts, setAttempts] = useState(0);

  const targetWords = useMemo(
    () =>
      sentence.targetSentence.split(/\s+/).map((w) =>
        stripPunctuation ? stripPunctuation(w) : w
      ),
    [sentence.targetSentence, stripPunctuation]
  );

  const [scrambled] = useState(() => {
    const sentenceWords = new Set(targetWords);
    const candidates = (words ?? [])
      .map((w) => stripPunctuation ? stripPunctuation(w.targetWord) : w.targetWord)
      .filter((w) => !sentenceWords.has(w));
    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Add up to 3 distractor words
    const distractorWords = shuffled.slice(0, Math.min(3, shuffled.length));
    // Combine correct words with distractors, then shuffle
    const allWords = [...targetWords, ...distractorWords];
    const scrambledWords = [...allWords];
    for (let i = scrambledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambledWords[i], scrambledWords[j]] = [scrambledWords[j], scrambledWords[i]];
    }
    return scrambledWords;
  });

  const handleSelect = useCallback(
    (index: number) => {
      if (feedback) return;

      setSelectedIndices((prev) => {
        if (prev.includes(index)) {
          return prev.filter((i) => i !== index);
        }
        return [...prev, index];
      });
    },
    [feedback]
  );

  const handleSubmit = useCallback(() => {
    if (feedback) return;

    const currentAttempts = attempts;
    setAttempts((prev) => prev + 1);

    const selectedWords = selectedIndices.map((idx) => scrambled[idx]);
    const isCorrect = isValidSentenceSelection(selectedWords, targetWords, words);

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
  }, [feedback, attempts, selectedIndices, scrambled, targetWords, words, content.id, onResult]);

  const handleReset = useCallback(() => {
    setSelectedIndices([]);
    setFeedback(null);
    setAttempts(0);
  }, []);

  return (
    <div style={styles.container}>
      <p style={styles.instruction}>Arrange the words to form the correct sentence:</p>

      <div style={styles.answerArea}>
        {selectedIndices.length === 0 ? (
          <p style={styles.placeholder}>Tap words below to build your sentence...</p>
        ) : (
          <div style={styles.wordsRow}>
            {selectedIndices.map((idx) => (
              <button
                key={idx}
                style={styles.wordChip}
                onClick={() => handleSelect(idx)}
                disabled={!!feedback}
              >
                {scrambled[idx]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.sourceArea}>
        {scrambled.map((word, i) =>
          selectedIndices.includes(i) ? null : (
            <button
              key={i}
              style={styles.wordChip}
              onClick={() => handleSelect(i)}
              disabled={!!feedback}
            >
              {word}
            </button>
          )
        )}
      </div>

      {!feedback ? (
        <button style={styles.button} onClick={handleSubmit} disabled={selectedIndices.length === 0}>
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
