import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useContent } from '@/contexts/ContentContext';
import StreakDisplay from '@/components/StreakDisplay';

export default function Home() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { streak, dailyChallenges } = useProgress();
  const { loaded } = useContent();
  const [hasChallenge, setHasChallenge] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayResult = dailyChallenges.find((d) => d.date === today);
    setHasChallenge(!!todayResult);
  }, [dailyChallenges]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Language Challenge</h1>
        <p style={styles.subtitle}>Daily German practice. Share your grid.</p>
      </header>

      <div style={styles.streakSection}>
        <StreakDisplay />
      </div>

      {loaded ? (
        <div style={styles.actions}>
          <button
            style={styles.primaryButton}
            onClick={() => navigate('/daily')}
          >
            {hasChallenge ? "Continue Today's Challenge" : "Today's Challenge"}
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate('/practice')}
          >
            Practice Mode
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate('/history')}
          >
            History
          </button>
        </div>
      ) : (
        <p style={styles.loading}>Loading content...</p>
      )}

      <footer style={styles.footer}>
        <p>{language.toUpperCase()} • {streak} day streak</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 500,
    margin: '0 auto',
    padding: '20px 16px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: '#1a1a1a',
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#6b7280',
    fontSize: 14,
  },
  streakSection: {
    textAlign: 'center',
    marginBottom: 24,
  },
  loading: {
    textAlign: 'center',
    color: '#6b7280',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    flex: 1,
  },
  primaryButton: {
    padding: '16px 24px',
    fontSize: 18,
    fontWeight: 700,
    background: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(45, 106, 79, 0.3)',
  },
  secondaryButton: {
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: 600,
    background: '#f0fdf4',
    color: '#2d6a4f',
    border: '2px solid #2d6a4f',
    borderRadius: 12,
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    padding: '20px 0',
    color: '#9ca3af',
    fontSize: 13,
  },
};
