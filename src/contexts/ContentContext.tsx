import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { LanguageDeck, Word, Sentence, Exercise } from '@/types';
import { initContentStore, getWords, getSentences, getExercises } from '@/stores/contentStore';

interface ContentContextType {
  words: Word[];
  sentences: Sentence[];
  exercises: Exercise[];
  getWordById: (id: string) => Promise<Word | undefined>;
  getExerciseById: (id: string) => Promise<Exercise | undefined>;
  loaded: boolean;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ children, deck }: { children: React.ReactNode; deck: LanguageDeck }) {
  const [words, setWords] = useState<Word[]>([]);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    await initContentStore(deck);
    const [w, s, e] = await Promise.all([getWords(), getSentences(), getExercises()]);
    setWords(w);
    setSentences(s);
    setExercises(e);
    setLoaded(true);
  }, [deck]);

  // Load once on mount
  useEffect(() => {
    load();
  }, [load]);

  const getWordById = useCallback(
    async (id: string) => {
      return words.find((w) => w.id === id);
    },
    [words]
  );

  const getExerciseById = useCallback(
    async (id: string) => {
      return exercises.find((e) => e.id === id);
    },
    [exercises]
  );

  const value: ContentContextType = {
    words,
    sentences,
    exercises,
    getWordById,
    getExerciseById,
    loaded,
  };

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export function useContent(): ContentContextType {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}
