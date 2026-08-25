# ProjectMatch

A team-formation web app for university students — post a project, get ranked
candidate suggestions based on skill/availability fit, mutually accept a
match, and message through the app.

Live: https://projectmatch-jade.vercel.app

## Stack

Vite + React (JS) + Firebase (Auth + Firestore, client SDK only) + Tailwind CSS + lucide-react.

## Local setup

```
npm install
cp .env.example .env   # fill in your Firebase project's web config
npm run dev
```

Firebase project needs:
- **Authentication → Sign-in method → Email/Password** enabled
- **Firestore Database** created, with `firestore.rules` in this repo published to it (permissive by design — see comments in the file; not production-grade)

## Seeding demo data

While signed in, visit `/dev-seed` and click **Run seed**. Creates 9 varied
candidate profiles, 3 sample projects (one per context type), and a few
corridor board / topic room posts. Safe to re-run. Remove this route before a
real public launch.

## Verification scripts

`scripts/*.mjs` are one-off Node scripts (not part of the built app) that
exercise the core flows end-to-end against a live Firebase project — signup,
profile save, project posting, matching engine, request/accept, chat, corridor
board, topic rooms, direct messages, and the fairness-aware ranking boost.
Run with `node scripts/exercise.mjs` (needs a populated `.env`).

## What's real vs. mocked

Everything except the following is fully functional and Firestore-backed:
- **Open hours** (`/open-hours`) — static example slots, no real scheduling
- Reputation score / verified badge — static seed values, no real pipeline
- Workspace/task board — static placeholder, no drag-and-drop or persistence

These are labeled "Coming soon" in the UI and as mocked in code comments.
