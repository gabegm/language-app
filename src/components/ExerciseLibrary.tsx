import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '@/contexts/ContentContext';
import type { Word, Sentence } from '@/types';

export default function ExerciseLibrary() {
  const navigate = useNavigate();
  const { exercises, words, sentences, loaded } = useContent();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? exercises : exercises.filter((e) => e.type === filter);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Practice Mode</h2>

      <div style={styles.filters}>
        {['all', 'flashcard', 'sentenceBuilder', 'matching', 'fillBlank'].map((type) => (
          <button
            key={type}
            style={{
              ...styles.filterButton,
              ...(filter === type ? styles.filterButtonActive : {}),
            }}
            onClick={() => setFilter(type)}
          >
            {type === 'all' ? 'All' : type.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>

      {!loaded ? (
        <p style={styles.loading}>Loading exercises...</p>
      ) : filtered.length === 0 ? (
        <p style={styles.empty}>No exercises available yet. Check back soon!</p>
      ) : (
        <div style={styles.list}>
          {filtered.map((exercise) => {
            const word = words.find((w) => w.id === exercise.contentId);
            const sentence = sentences.find((s) => s.id === exercise.contentId);
            const content = (word || sentence) as Word | Sentence | undefined;

            if (!content) return null;

            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                content={content}
                onPlay={() => {
                  navigate(`/practice/${exercise.id}`);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({
  exercise,
  content,
  onPlay,
}: {
  exercise: { id: string; type: string };
  content: Word | Sentence;
  onPlay: () => void;
}) {
  const isWord = 'translation' in content;
  const displayWord = isWord ? (content as Word).targetWord : (content as Sentence).targetSentence;

  return (
    <button style={styles.card} onClick={onPlay}>
      <div style={styles.cardContent}>
        <span style={styles.cardWord}>{displayWord}</span>
        <span style={styles.cardType}>{exercise.type.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span style={styles.cardDifficulty}>{'★'.repeat(content.difficulty)}</span>
      </div>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 500,
    margin: '0 auto',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  loading: {
    color: '#6b7280',
    textAlign: 'center',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    padding: '6px 12px',
    fontSize: 13,
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: 16,
    cursor: 'pointer',
  },
  filterButtonActive: {
    background: '#2d6a4f',
    color: '#fff',
    border: '1px solid #2d6a4f',
  },
  empty: {
    color: '#6b7280',
    textAlign: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  card: {
    padding: '14px 16px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  cardWord: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a1a1a',
    flex: 1,
  },
  cardType: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardDifficulty: {
    fontSize: 12,
    color: '#d97706',
  },
};
