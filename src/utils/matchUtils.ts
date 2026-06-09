/**
 * Check if two strings are "close" matches.
 * Used to determine when to show 🟨 (partial credit) in emoji grid.
 */

export function isCloseMatch(input: string, target: string): boolean {
  const normalizedInput = normalizeString(input);
  const normalizedTarget = normalizeString(target);

  // Exact match is 🟩, not 🟨
  if (normalizedInput === normalizedTarget) return false;

  // Within 1 character edit distance (Levenshtein)
  if (editDistance(normalizedInput, normalizedTarget) <= 1) return true;

  // Same length, same first and last character
  if (
    normalizedInput.length === normalizedTarget.length &&
    normalizedInput.length >= 2 &&
    normalizedInput[0] === normalizedTarget[0] &&
    normalizedInput[normalizedInput.length - 1] === normalizedTarget[normalizedTarget.length - 1]
  ) {
    return true;
  }

  return false;
}

/**
 * Check if a sentence builder attempt has the correct words (wrong order).
 */
export function hasCorrectWords(inputWords: string[], targetWords: string[]): boolean {
  const normalizedInput = inputWords.map(w => normalizeString(w).toLowerCase());
  const normalizedTarget = targetWords.map(w => normalizeString(w).toLowerCase());

  if (normalizedInput.length !== normalizedTarget.length) return false;

  const inputSet = new Set(normalizedInput);
  return normalizedTarget.every(w => inputSet.has(w));
}

function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"'()]/g, '')
    .replace(/\s+/g, ' ');
}

function editDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a scrambled version of a sentence (words in random order).
 */
export function generateScrambled(sentence: string): string {
  const words = sentence.split(/\s+/);
  if (words.length <= 1) return sentence;
  const shuffled = shuffleArray(words);
  return shuffled.join(' ');
}
