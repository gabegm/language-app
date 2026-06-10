import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { LanguageDeck, Exercise } from '@/types';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { initContentStore } from '@/stores/contentStore';
import words from '@/data/de/words.json';
import sentences from '@/data/de/sentences.json';
import exercises from '@/data/de/exercises.json';
import Home from '@/components/Home';
import DailyChallenge from '@/components/DailyChallenge';
import ExerciseLibrary from '@/components/ExerciseLibrary';
import ExerciseRunner from '@/components/Exercise/ExerciseRunner';
import History from '@/components/History';
import LanguageSelector from '@/components/LanguageSelector';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const deck: LanguageDeck = {
  id: 'de',
  name: 'German',
  words,
  sentences,
  exercises: exercises as Exercise[],
};

function AppRoutes() {
  const { language } = useLanguage();

  useEffect(() => {
    initContentStore(deck);
  }, []);

  return (
    <ContentProvider deck={deck}>
      <ProgressProvider language={language}>
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
          <LanguageSelector />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/daily" element={<DailyChallenge />} />
            <Route path="/practice" element={<ExerciseLibrary />} />
            <Route path="/practice/:exerciseId" element={<ExerciseRunner />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </ProgressProvider>
    </ContentProvider>
  );
}

function App() {
  return (
    <BrowserRouter basename="/language-app/">
      <ErrorBoundary>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
