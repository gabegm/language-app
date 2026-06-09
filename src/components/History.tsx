import { useProgress } from '@/contexts/ProgressContext';

export default function History() {
  const { dailyChallenges } = useProgress();

  const sorted = [...dailyChallenges].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>History</h2>

      {sorted.length === 0 ? (
        <p style={styles.empty}>No challenges completed yet. Start today's challenge!</p>
      ) : (
        <div style={styles.list}>
          {sorted.map((result) => (
            <div key={result.date} style={styles.item}>
              <span style={styles.date}>{result.date}</span>
              <span style={styles.grid}>{result.emojiGrid}</span>
              <span style={styles.stats}>
                {result.correct}/{result.total}
              </span>
            </div>
          ))}
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
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  empty: {
    color: '#6b7280',
    textAlign: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#f9fafb',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
    minWidth: 90,
  },
  grid: {
    fontSize: 20,
    letterSpacing: 2,
    flex: 1,
  },
  stats: {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
  },
};
