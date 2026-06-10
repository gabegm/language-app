import { useCallback, useState } from 'react';
import type { ExerciseResult, Sentence, Word } from '@/types';

interface ReverseFlashcardProps {
  content: Word | Sentence;
  onResult: (result: ExerciseResult) => void;
  onNext?: () => void;
  allowRetry?: boolean;
}

export default function ReverseFlashcard({ content, onResult, onNext, allowRetry = true }: ReverseFlashcardProps) {
  const word = content as Word;
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = useCallback(() => {
    if (feedback) return;

    const nextAttempts = attempts + 1;
    const correct = input.trim().toLocaleLowerCase('de-DE') === word.targetWord.toLocaleLowerCase('de-DE');
    setAttempts(nextAttempts);
    setFeedback(correct ? 'correct' : 'incorrect');
    onResult({
      exerciseId: word.id,
      correct,
      attempts: nextAttempts,
      timestamp: new Date().toISOString(),
    });
  }, [attempts, feedback, input, onResult, word.id, word.targetWord]);

  const handleRetry = useCallback(() => {
    setInput('');
    setFeedback(null);
    setAttempts(0);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <p style={styles.label}>Translate to German:</p>
        <h2 style={styles.target}>{word.translation}</h2>
      </div>

      <input
        style={styles.input}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && !feedback && handleSubmit()}
        placeholder="Type the German word..."
        disabled={!!feedback}
      />

      {!feedback ? (
        <button style={styles.button} onClick={handleSubmit}>Check</button>
      ) : (
        <div style={styles.feedback}>
          {feedback === 'correct' ? (
            <span style={styles.correct}>✓ Correct! Word: <strong>{word.targetWord}</strong></span>
          ) : (
            <span style={styles.incorrect}>✗ Word: <strong>{word.targetWord}</strong></span>
          )}
          {allowRetry && feedback === 'incorrect' && (
            <button style={styles.retryButton} onClick={handleRetry}>Try Again</button>
          )}
          {!allowRetry && onNext && (
            <button style={styles.nextButton} onClick={onNext}>Next Question →</button>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 500, margin: '0 auto', padding: 20 },
  card: { background: '#f0fdf4', border: '2px solid #2d6a4f', borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 20 },
  label: { margin: 0, color: '#6b7280', fontSize: 14 },
  target: { margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#1a1a1a' },
  input: { padding: '12px 16px', fontSize: 16, border: '2px solid #d1d5db', borderRadius: 8, outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: 12 },
  button: { padding: '12px 24px', fontSize: 16, fontWeight: 600, background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%' },
  feedback: { display: 'flex', flexDirection: 'column', gap: 8 },
  correct: { color: '#2d6a4f', fontWeight: 600, fontSize: 16 },
  incorrect: { color: '#dc2626', fontSize: 14 },
  retryButton: { padding: '8px 16px', fontSize: 14, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' },
  nextButton: { padding: '12px 24px', fontSize: 14, fontWeight: 600, background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%' },
};
