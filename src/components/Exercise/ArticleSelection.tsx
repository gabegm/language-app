import { useCallback, useState } from 'react';
import type { ExerciseResult, Sentence, Word } from '@/types';

interface ArticleSelectionProps {
  content: Word | Sentence;
  onResult: (result: ExerciseResult) => void;
  onNext?: () => void;
  allowRetry?: boolean;
}

const ARTICLES = ['der', 'die', 'das'];

export default function ArticleSelection({ content, onResult, onNext, allowRetry = true }: ArticleSelectionProps) {
  const word = content as Word;
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = useCallback(() => {
    if (feedback || !selectedArticle || !word.gender) return;

    const nextAttempts = attempts + 1;
    const correct = selectedArticle === word.gender;
    setAttempts(nextAttempts);
    setFeedback(correct ? 'correct' : 'incorrect');
    onResult({
      exerciseId: word.id,
      correct,
      attempts: nextAttempts,
      timestamp: new Date().toISOString(),
    });
  }, [attempts, feedback, onResult, selectedArticle, word.gender, word.id]);

  const handleRetry = useCallback(() => {
    setSelectedArticle(null);
    setFeedback(null);
    setAttempts(0);
  }, []);

  return (
    <div style={styles.container}>
      <p style={styles.instruction}>Choose the correct article:</p>
      <div style={styles.card}>
        <h2 style={styles.target}>{word.targetWord}</h2>
        <p style={styles.translation}>({word.translation})</p>
      </div>

      <div style={styles.options}>
        {ARTICLES.map((article) => (
          <button
            key={article}
            style={{
              ...styles.optionButton,
              ...(selectedArticle === article ? styles.selectedOption : {}),
              ...(feedback === 'correct' && article === word.gender ? styles.correctOption : {}),
              ...(feedback === 'incorrect' && selectedArticle === article ? styles.wrongOption : {}),
            }}
            onClick={() => setSelectedArticle(article)}
            disabled={!!feedback}
          >
            {article}
          </button>
        ))}
      </div>

      {!feedback ? (
        <button style={{ ...styles.button, opacity: selectedArticle ? 1 : 0.5 }} onClick={handleSubmit} disabled={!selectedArticle}>
          Check
        </button>
      ) : (
        <div style={styles.feedback}>
          {feedback === 'correct' ? (
            <span style={styles.correct}>✓ Correct! Article: <strong>{word.gender}</strong></span>
          ) : (
            <span style={styles.incorrect}>✗ Article: <strong>{word.gender}</strong></span>
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
  instruction: { color: '#6b7280', fontSize: 14, marginBottom: 16 },
  card: { background: '#f0fdf4', border: '2px solid #2d6a4f', borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 20 },
  target: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1a1a1a' },
  translation: { margin: '8px 0 0', color: '#6b7280', fontSize: 14 },
  options: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 },
  optionButton: { padding: '12px 16px', fontSize: 18, fontWeight: 700, background: '#f0fdf4', border: '2px solid #2d6a4f', borderRadius: 8, cursor: 'pointer' },
  selectedOption: { background: '#d1fae5', border: '2px solid #059669' },
  correctOption: { background: '#2d6a4f', color: '#fff', border: '2px solid #1b4332' },
  wrongOption: { background: '#fee2e2', border: '2px solid #dc2626' },
  button: { padding: '12px 24px', fontSize: 16, fontWeight: 600, background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%' },
  feedback: { display: 'flex', flexDirection: 'column', gap: 8 },
  correct: { color: '#2d6a4f', fontWeight: 600, fontSize: 16 },
  incorrect: { color: '#dc2626', fontSize: 14 },
  retryButton: { padding: '8px 16px', fontSize: 14, background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' },
  nextButton: { padding: '12px 24px', fontSize: 14, fontWeight: 600, background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%' },
};
