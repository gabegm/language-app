import type { DailyChallengeResult } from '@/types';

const EMOJI_CORRECT = '🟩';
const EMOJI_WRONG = '⬜';

/**
 * Parse an emoji grid string into per-question results.
 * Returns an array of booleans: true = correct, false = wrong.
 */
export function parseEmojiGrid(grid: string): boolean[] {
  const results: boolean[] = [];
  for (const emoji of [...grid]) {
    results.push(emoji === EMOJI_CORRECT);
  }
  return results;
}

/**
 * Generate an emoji grid string from a daily challenge result.
 * 🟩 = correct, 🟨 = wrong but close, ⬜ = wrong
 */
export function generateEmojiGrid(result: DailyChallengeResult): string {
  const { correct, total, emojiGrid } = result;

  // If emoji grid is already stored (from a previous run), return it
  if (emojiGrid) return emojiGrid;

  // Generate from correct/total counts
  const greenCount = correct;
  const totalSlots = total;

  let grid = '';
  for (let i = 0; i < totalSlots; i++) {
    if (i < greenCount) {
      grid += EMOJI_CORRECT;
    } else {
      grid += EMOJI_WRONG;
    }
  }

  return grid;
}

export function generateEmojiGridFromResults(results: boolean[]): string {
  return results.map((correct) => correct ? EMOJI_CORRECT : EMOJI_WRONG).join('');
}

/**
 * Copy emoji grid to clipboard and return success status.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}
