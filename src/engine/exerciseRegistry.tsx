import type { Word, Sentence, ExerciseResult } from '@/types';
import Flashcard from '@/components/Exercise/Flashcard';
import SentenceBuilder from '@/components/Exercise/SentenceBuilder';
import Matching from '@/components/Exercise/Matching';
import FillBlank from '@/components/Exercise/FillBlank';

export function renderExercise(
  type: string,
  content: Word | Sentence,
  onResult: (result: ExerciseResult) => void,
  words?: Word[],
  stripPunctuation?: (word: string) => string,
  onNext?: () => void,
  allowRetry?: boolean,
  maxPairs?: number
): React.ReactNode {
  const props = { content, onResult, words, stripPunctuation, onNext, allowRetry, maxPairs };
  switch (type) {
    case 'flashcard':
      return <Flashcard {...props} />;
    case 'sentenceBuilder':
      return <SentenceBuilder {...props} />;
    case 'matching':
      return <Matching {...props} />;
    case 'fillBlank':
      return <FillBlank {...props} />;
    default:
      return <p>Unknown exercise type: {type}</p>;
  }
}
