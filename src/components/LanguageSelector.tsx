import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { value: 'de', label: '🇩🇪 German' },
    { value: 'fr', label: '🇫🇷 French (coming soon)' },
    { value: 'es', label: '🇪🇸 Spanish (coming soon)' },
  ];

  return (
    <div style={styles.container}>
      <select
        style={styles.select}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value} disabled={lang.value !== 'de'}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  select: {
    padding: '8px 16px',
    fontSize: 15,
    border: '2px solid #d1d5db',
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer',
  },
};
