import { useState, useCallback, useMemo } from 'react';
import type { Word, Sentence, ExerciseResult } from '@/types';

interface MatchingProps {
  content: Word | Sentence;
  onResult: (result: ExerciseResult) => void;
  onNext?: () => void;
  words?: Word[];
  allowRetry?: boolean;
  stripPunctuation?: (word: string) => string;
  /** Maximum number of pairs to show (default: 5). Set to 1 for single-word matching. */
  maxPairs?: number;
}

export default function Matching({ content, onResult, onNext, words, allowRetry = true, maxPairs = 5 }: MatchingProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [selectedPairs, setSelectedPairs] = useState<Array<{ leftId: string; rightId: string; correct: boolean }>>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Resolve the anchor word: if content is a Sentence, look up its corresponding Word from words
  const anchorWord = useMemo(() => {
    if ('targetWord' in content) {
      return content as Word;
    }
    // Content is a Sentence — find a Word that matches by contentId === sentence.id
    if (words) {
      const matchingWord = words.find((w) => w.id === (content as Sentence).id);
      if (matchingWord) return matchingWord;
    }
    // Fallback: use the sentence's targetSentence as targetWord and translation as translation
    return {
      id: content.id,
      targetWord: (content as Sentence).targetSentence,
      translation: (content as Sentence).translation,
    } as Word;
  }, [content, words]);

  // Build pairs: the passed content is always included (anchor), fill rest from words
  // Cap total pairs to maxPairs (default 5) to avoid overwhelming the user
  const pairs = useMemo(() => {
    // Filter distractors by gender if the anchor word has one
    const otherWords = words
      ? words.filter((w) => {
          if (w.id === anchorWord.id) return false;
          // If anchor has a gender, only include words with matching gender
          if (anchorWord.gender) {
            return w.gender === anchorWord.gender;
          }
          return true;
        })
      : [];
    const shuffled = [...otherWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Cap distractors so total pairs <= maxPairs
    const maxDistractors = Math.max(0, maxPairs - 1);
    const selectedWords = shuffled.slice(0, maxDistractors);

    return [
      { id: anchorWord.id, targetWord: anchorWord.targetWord, translation: anchorWord.translation },
      ...selectedWords.map((w) => ({
        id: w.id,
        targetWord: w.targetWord,
        translation: w.translation,
      })),
    ];
  }, [anchorWord, words, maxPairs]);

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

  const tentativeMatchedIds = useMemo(() => {
    return new Set(selectedPairs.flatMap((pair) => [pair.leftId, pair.rightId]));
  }, [selectedPairs]);
  const displayedMatchedIds = allowRetry ? matchedPairs : tentativeMatchedIds;

  const handleSelect = useCallback(
    (itemId: string) => {
      if (feedback) return;

      if (!allowRetry) {
        const allItems = [...leftItems, ...rightItems];
        const currentItem = allItems.find((i) => i.id === itemId);
        const selectedPair = selectedPairs.find((pair) => pair.leftId === itemId || pair.rightId === itemId);

        if (!selected) {
          if (selectedPair) {
            setSelectedPairs((prev) =>
              prev.filter((pair) => pair.leftId !== selectedPair.leftId && pair.rightId !== selectedPair.rightId)
            );
            return;
          }
          setSelected(itemId);
          return;
        }

        if (selected === itemId) {
          setSelected(null);
          return;
        }

        const selectedItem = allItems.find((i) => i.id === selected);
        if (!selectedItem || !currentItem) return;

        const selectedIsLeft = selectedItem.id.endsWith('-l');
        const currentIsLeft = currentItem.id.endsWith('-l');

        if (selectedIsLeft === currentIsLeft) {
          setSelected(itemId);
          return;
        }

        const leftId = selectedIsLeft ? selectedItem.id : currentItem.id;
        const rightId = selectedIsLeft ? currentItem.id : selectedItem.id;
        const correct = selectedItem.pairId === currentItem.pairId;

        setAttempts((prev) => prev + 1);
        setSelectedPairs((prev) => {
          const withoutConflicts = prev.filter(
            (pair) => pair.leftId !== leftId && pair.rightId !== rightId
          );
          return [...withoutConflicts, { leftId, rightId, correct }];
        });
        setSelected(null);
        return;
      }

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

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

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
    [selected, matchedPairs, selectedPairs, leftItems, rightItems, feedback, attempts, allowRetry]
  );

  const allMatched = allowRetry
    ? matchedPairs.size === leftItems.length * 2
    : selectedPairs.length === pairs.length;

  const handleCheck = useCallback(() => {
    if (!allMatched) return;
    const correct = selectedPairs.length > 0
      ? selectedPairs.every((pair) => pair.correct)
      : true;
    setFeedback(correct ? 'correct' : 'incorrect');
    onResult({
      exerciseId: content.id,
      correct,
      attempts: attempts + 1,
      timestamp: new Date().toISOString(),
    });
  }, [allMatched, selectedPairs, content.id, onResult, attempts]);

  const handleRetry = useCallback(() => {
    setSelected(null);
    setMatchedPairs(new Set());
    setSelectedPairs([]);
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
              ...(displayedMatchedIds.has(item.id) ? styles.itemMatched : {}),
              ...(feedback === 'incorrect' && selected === item.id ? styles.itemWrong : {}),
            }}
            onClick={() => handleSelect(item.id)}
            disabled={(allowRetry && matchedPairs.has(item.id)) || !!feedback}
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
              ...(displayedMatchedIds.has(item.id) ? styles.itemMatched : {}),
              ...(feedback === 'incorrect' && selected === item.id ? styles.itemWrong : {}),
            }}
            onClick={() => handleSelect(item.id)}
            disabled={(allowRetry && matchedPairs.has(item.id)) || !!feedback}
          >
            {item.text}
          </button>
        ))}
      </div>

      {!feedback ? (
        <div>
          <div style={styles.progress}>
            {displayedMatchedIds.size / 2} / {pairs.length} pairs matched
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
            <>
              <span style={styles.correct}>✓ All matched!</span>
              <div style={styles.pairList}>
                {leftItems
                  .filter((item) => displayedMatchedIds.has(item.id))
                  .map((leftItem) => {
                    const rightItem = rightItems.find((r) => r.pairId === leftItem.pairId);
                    return rightItem ? (
                      <div key={leftItem.pairId} style={styles.pairRow}>
                        <span style={styles.pairWord}>{leftItem.text}</span>
                        <span style={styles.pairArrow}>→</span>
                        <span style={styles.pairTranslation}>{rightItem.text}</span>
                      </div>
                    ) : null;
                  })}
              </div>
            </>
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
  pairList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: 8,
    padding: '8px 12px',
    background: '#f0fdf4',
    borderRadius: 6,
    border: '1px solid #2d6a4f',
  },
  pairRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 14,
  },
  pairWord: {
    fontWeight: 600,
    color: '#1a1a1a',
  },
  pairArrow: {
    color: '#2d6a4f',
    fontWeight: 700,
  },
  pairTranslation: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  retryButton: {
    padding: '8px 16px',
    fontSize: 14,
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    cursor: 'pointer',
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
