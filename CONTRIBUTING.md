# Contributing to Language Challenge

Thank you for your interest in contributing! This document covers how to get started and what to expect.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/language-app.git
   cd language-app
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Start** the dev server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/        # React UI components
│   └── Exercise/      # Flashcard, SentenceBuilder, Matching, FillBlank
├── contexts/          # Language, Progress, Content contexts
├── data/{code}/       # Language decks (words, sentences, exercises JSON)
├── engine/            # Daily challenge generation (deterministic)
├── stores/            # Local storage (localforage)
├── types/             # TypeScript definitions
└── utils/             # Shared utilities
```

## Adding a New Language Deck

1. Create a folder under `src/data/{code}/` (e.g., `src/data/fr/`)
2. Add three JSON files:
   - **`words.json`** — Vocabulary entries with `id`, `targetWord`, and `translation`
   - **`sentences.json`** — Sentence entries with `id`, `targetSentence`, and `translation`
   - **`exercises.json`** — Exercise definitions mapping IDs to content

Example `words.json`:
```json
[
  { "id": "chat", "targetWord": "le chat", "translation": "the cat" },
  { "id": "chien", "targetWord": "le chien", "translation": "the dog" }
]
```

## Adding a New Exercise Type

1. Create a component in `src/components/Exercise/`
2. Register it in `src/engine/exerciseRegistry.tsx`
3. Add the exercise type to `exercises.json` for your language deck
4. Write tests in `src/components/Exercise/YourExercise.test.tsx`

## Coding Standards

- **TypeScript** — All code must be typed. No `any` unless justified.
- **React 19** — Use functional components with hooks. No class components.
- **Context API** — Use custom hooks (`useLanguage()`, `useProgress()`, `useContent()`) for state access.
- **Deterministic** — The daily challenge engine must produce the same results for the same date.
- **Tests** — All new features must include tests. Aim for >80% coverage.

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add French language deck
fix: correct daily challenge seed collision
docs: update README with setup instructions
refactor: extract progress logic into custom hook
test: add matching exercise unit tests
```

## Pull Requests

1. Create a branch from `main`: `git checkout -b feature/your-feature`
2. Make your changes
3. Ensure all checks pass:
   ```bash
   npm test
   npm run lint
   npm run build
   ```
4. Submit a pull request with the PR template filled out

## Questions?

Open an issue labeled `question` and we'll help you out.
