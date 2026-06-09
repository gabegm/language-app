import { useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContent } from '@/contexts/ContentContext';
import { useProgress } from '@/contexts/ProgressContext';
import type { Word, Sentence, ExerciseResult } from '@/types';
import { renderExercise } from '@/engine/exerciseRegistry';

export default function ExerciseRunner() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { exercises, words, sentences, loaded } = useContent();
  const { addExerciseResult } = useProgress();

  const exercise = exercises.find((e) => e.id === exerciseId);
  const content = useMemo(() => {
    if (!exercise) return null;
    const word = words.find((w) => w.id === exercise.contentId);
    const sentence = sentences.find((s) => s.id === exercise.contentId);
    return (word || sentence) as Word | Sentence | null;
  }, [exercise, words, sentences]);

  const handleResult = useCallback(
    (result: ExerciseResult) => {
      addExerciseResult(result);
    },
    [addExerciseResult]
  );

  const stripPunctuation = useCallback((word: string) => word.replace(/[.,!?;:"'()]/g, ''), []);

  if (!loaded) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading exercise...</p>
      </div>
    );
  }

  if (!exercise || !content) {
    return (
      <div style={styles.container}>
        <p>Exercise not found.</p>
        <button style={styles.homeButton} onClick={() => navigate('/practice')}>
          Back to Practice
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate('/practice')}>
        ← Back to Practice
      </button>
      <div key={content.id}>{renderExercise(exercise.type, content, handleResult, words, stripPunctuation)}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 500,
    margin: '0 auto',
    padding: 20,
  },
  loading: {
    color: '#6b7280',
    textAlign: 'center',
  },
  homeButton: {
    padding: '12px 24px',
    fontSize: 14,
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    cursor: 'pointer',
    width: '100%',
    marginTop: 16,
  },
  backButton: {
    padding: '8px 16px',
    fontSize: 14,
    background: 'transparent',
    border: 'none',
    color: '#2d6a4f',
    cursor: 'pointer',
    marginBottom: 16,
  },
};
