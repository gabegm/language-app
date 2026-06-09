import localforage from 'localforage';
import type { LanguageDeck, Word, Sentence, Exercise } from '@/types';

const CONTENT_STORE_NAME = 'language-content';

// Singleton instance — created once, reused everywhere
const store = localforage.createInstance({
  name: CONTENT_STORE_NAME,
});

const DECK_KEY = 'de';

// Initialize content store with bundled data
export async function initContentStore(deck: LanguageDeck): Promise<void> {
  await store.setItem(`${DECK_KEY}-words`, deck.words);
  await store.setItem(`${DECK_KEY}-sentences`, deck.sentences);
  await store.setItem(`${DECK_KEY}-exercises`, deck.exercises);
}

export async function getWords(): Promise<Word[]> {
  return (await store.getItem(`${DECK_KEY}-words`)) as Word[] || [];
}

export async function getSentences(): Promise<Sentence[]> {
  return (await store.getItem(`${DECK_KEY}-sentences`)) as Sentence[] || [];
}

export async function getExercises(): Promise<Exercise[]> {
  return (await store.getItem(`${DECK_KEY}-exercises`)) as Exercise[] || [];
}

export async function getWordById(id: string): Promise<Word | undefined> {
  const words = await getWords();
  return words.find((w) => w.id === id);
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  const exercises = await getExercises();
  return exercises.find((e) => e.id === id);
}
