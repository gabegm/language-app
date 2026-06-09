# Language Challenge

A progressive web app for daily language learning with deterministic challenges, progress tracking, and shareable emoji grids.

## Features

- **Daily Challenges** — One unique set of exercises per day, generated deterministically from the date
- **Multiple Exercise Types** — Flashcards, sentence building, matching pairs, and fill-in-the-blank
- **Progress Tracking** — Streaks, accuracy history, and per-question emoji grids stored locally
- **Shareable Results** — Export your daily score as an emoji grid image for social sharing
- **Offline-First PWA** — Install as a native app; works fully offline with service worker caching
- **Multi-Language** — Currently supports German → English; extensible to other language pairs

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/gabegm/language-app.git
cd language-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Building for Production

```bash
npm run build
npm run preview
```

The production build outputs to `dist/` and includes a service worker for offline support.

## Project Structure

```
src/
├── components/        # React UI components
│   ├── Exercise/      # Individual exercise types
│   └── ...
├── contexts/          # React contexts (language, progress, content)
├── data/de/           # Language deck data (words, sentences, exercises)
├── engine/            # Daily challenge generation engine
├── stores/            # Local storage adapters (localforage)
├── types/             # TypeScript type definitions
└── utils/             # Shared utilities (sharing, matching logic)
```

## Data Format

Language decks are defined in JSON files under `src/data/{code}/`:

- **`words.json`** — Vocabulary with German target words and English translations
- **`sentences.json`** — Sentence-level exercises with target and translation
- **`exercises.json`** — Maps exercise IDs to content IDs and specifies exercise type

## Sharing

The app generates shareable emoji grids showing your daily performance:

```
🟩🟩🟨⬜🟩
```

- 🟩 = Correct
- 🟨 = Partially correct
- ⬜ = Missed

Share via the "Share" button on the daily challenge results screen.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** — Build tool and dev server
- **React Router 7** — Client-side routing
- **localforage** — IndexedDB-backed persistent storage
- **Vite PWA Plugin** — Service worker and offline support
- **Vitest** — Unit testing

## License

[MIT](./LICENSE) — Free for personal and commercial use.
