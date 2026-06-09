import { useState } from 'react';
import { copyToClipboard } from '@/utils/shareGenerator';

interface ShareButtonProps {
  emojiGrid: string;
}

export default function ShareButton({ emojiGrid }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `🇩🇪 Daily Challenge: ${emojiGrid}`;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button style={styles.button} onClick={handleShare}>
      {copied ? '✓ Copied!' : '📋 Copy to Share'}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: 600,
    background: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    width: '100%',
  },
};
