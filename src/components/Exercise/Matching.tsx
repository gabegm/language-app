import { useState, useCallback, useMemo } from 'react';
import type { Word, Sentence, ExerciseResult } from '@/types';

interface MatchingProps {
  content: Word | Sentence;
  onResult: (result: ExerciseResult) => void;
  onNext?: () => void;
  words?: Word[];
  allowRetry?: boolean;
}

export default function Matching({ content, onResult, onNext, words, allowRetry = true }: MatchingProps) {
  const word = content as Word;
  const [selected, setSelected] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Build 4 pairs: the passed content is always included (anchor), fill rest from words
  const pairs = useMemo(() => {
    if (!words || words.length < 4) {
      return [{ id: word.id, targetWord: word.targetWord, translation: word.translation }];
    }

    const otherWords = words.filter((w) => w.id !== word.id);
    const shuffled = [...otherWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selectedWords = shuffled.slice(0, 3);

    return [
      { id: word.id, targetWord: word.targetWord, translation: word.translation },
      ...selectedWords.map((w) => ({
        id: w.id,
        targetWord: w.targetWord,
        translation: w.translation,
      })),
    ];
  }, [word, words]);

  const { leftItems, rightItems } = useMemo(() => {
    const shuffledPairs = [...pairs];
    for (let i = shuffledPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPairs[i], shuffledPairs[j]] = [shuffledPairs[j], shuffledPairs[i]];
    }

    const left: Array<{ id: string; text: string; pairId: string }> = [];
    const right: Array<{ id: string; text: string; pairId: string }> = [];

    for (const p of shuffledPairs) {
      left.push({ id: `${p.id}-l`, text: p.targetWord, pairId: p.id });
      right.push({ id: `${p.id}-r`, text: p.translation, pairId: p.id });
    }

    return { leftItems: left, rightItems: right };
  }, [pairs]);

  const handleSelect = useCallback(
    (itemId: string) => {
      if (feedback) return;
      if (matchedPairs.has(itemId)) return;

      if (!selected) {
        setSelected(itemId);
        return;
      }

      if (selected === itemId) {
        setSelected(null);
        return;
      }

      const allItems = [...leftItems, ...rightItems];
      const selectedItem = allItems.find((i) => i.id === selected);
      const currentItem = allItems.find((i) => i.id === itemId);

      if (!selectedItem || !currentItem) return;

      const isMatch = selectedItem.pairId === currentItem.pairId;

      setAttempts((prev) => prev + 1);

      if (isMatch) {
        setMatchedPairs((prev) => new Set([...prev, selected, itemId]));
        setSelected(null);
      } else {
        setFeedback('incorrect');
        if (allowRetry) {
          setTimeout(() => {
            setSelected(null);
            setFeedback(null);
          }, 1000);
        }
      }
    },
    [selected, matchedPairs, leftItems, rightItems, feedback]
  );

  const allMatched = matchedPairs.size === leftItems.length * 2;

  const handleCheck = useCallback(() => {
    if (!allMatched) return;
    setFeedback('correct');
    onResult({
      exerciseId: content.id,
      correct: true,
      attempts: attempts + 1,
      timestamp: new Date().toISOString(),
    });
  }, [allMatched, content.id, onResult, attempts]);

  const handleRetry = useCallback(() => {
    setSelected(null);
    setMatchedPairs(new Set());
    setFeedback(null);
    setAttempts(0);
  }, []);

  return (
    <div style={styles.container}>
      <p style={styles.instruction}>Match the words with their translations:</p>

      <div style={styles.grid}>
        {leftItems.map((item) => (
          <button
            key={item.id}
            style={{
              ...styles.item,
              ...(selected === item.id ? styles.itemSelected : {}),
              ...(matchedPairs.has(item.id) ? styles.itemMatched : {}),
              ...(feedback === 'incorrect' && selected === item.id ? styles.itemWrong : {}),
            }}
            onClick={() => handleSelect(item.id)}
            disabled={matchedPairs.has(item.id) || !!feedback}
          >
            {item.text}
          </button>
        ))}
        {rightItems.map((item) => (
          <button
            key={item.id}
            style={{
              ...styles.item,
              ...(selected === item.id ? styles.itemSelected : {}),
              ...(matchedPairs.has(item.id) ? styles.itemMatched : {}),
              ...(feedback === 'incorrect' && selected === item.id ? styles.itemWrong : {}),
            }}
            onClick={() => handleSelect(item.id)}
            disabled={matchedPairs.has(item.id) || !!feedback}
          >
            {item.text}
          </button>
        ))}
      </div>

      {!feedback ? (
        <div>
          <div style={styles.progress}>
            {matchedPairs.size / 2} / {pairs.length} pairs matched
          </div>
          <button
            style={{ ...styles.button, opacity: allMatched ? 1 : 0.5 }}
            onClick={handleCheck}
            disabled={!allMatched}
          >
            Check
          </button>
        </div>
      ) : (
        <div style={styles.feedback}>
          {feedback === 'correct' ? (
            <span style={styles.correct}>✓ All matched!</span>
          ) : (
            <span style={styles.incorrect}>✗ Try again</span>
          )}
          {allowRetry && feedback === 'incorrect' && (
            <button style={styles.retryButton} onClick={handleRetry}>
              Retry
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 16,
  },
  item: {
    padding: '16px 12px',
    fontSize: 15,
    fontWeight: 500,
    background: '#e8f5e9',
    border: '2px solid #2d6a4f',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  itemSelected: {
    background: '#2d6a4f',
    color: '#fff',
    transform: 'scale(1.05)',
  },
  itemMatched: {
    background: '#2d6a4f',
    color: '#fff',
    border: '2px solid #1b4332',
    cursor: 'default',
  },
  itemWrong: {
    background: '#fee2e2',
    border: '2px solid #dc2626',
  },
  progress: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
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
