import { useProgress } from '@/contexts/ProgressContext';

export default function StreakDisplay() {
  const { streak } = useProgress();

  return (
    <div style={styles.container}>
      <span style={styles.fire}>🔥</span>
      <span style={styles.count}>{streak}</span>
      <span style={styles.label}>day streak</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: 20,
  },
  fire: {
    fontSize: 20,
  },
  count: {
    fontSize: 20,
    fontWeight: 700,
    color: '#d97706',
  },
  label: {
    fontSize: 13,
    color: '#92400e',
  },
};
