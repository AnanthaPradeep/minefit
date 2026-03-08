# MineFit (Vite + React + TypeScript)

MineFit is an offline-first, privacy-focused personal diet and fitness app.

## Tech Stack

- Vite + React + TypeScript
- TailwindCSS
- Zustand (state)
- Dexie (IndexedDB)
- Recharts

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Notes

- All user data is stored locally on-device (IndexedDB + local settings).
- Service worker is registered from the app bootstrap for offline support.
