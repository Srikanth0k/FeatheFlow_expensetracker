# FinFlow — Personal Expense Tracker

A modern, mobile-first personal expense management application built with React + FastAPI.

## Quick Start (Frontend)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

The frontend works **offline-first** with localStorage. To use the backend API, create `frontend/.env`:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_USE_LOCAL_STORAGE=false
```

Then restart the dev server (`npm run dev`). Env vars must be in **`frontend/.env`** — the backend `.env` is not read by Vite.

When you deploy the frontend, set the same `VITE_API_URL` in your host's build environment (Vercel, Netlify, etc.).

## Project Structure

```
cursor-expensestracker/
├── frontend/          # React + Vite + Tailwind (complete)
│   ├── src/
│   │   ├── components/   # UI, layout, analytics, AI, export
│   │   ├── pages/        # Dashboard, Expenses, Reports, Insights, Settings
│   │   ├── stores/       # Zustand state (finance, theme, settings)
│   │   ├── services/     # API, export, backup services
│   │   ├── hooks/        # useFinance, useDebounce, useMediaQuery
│   │   ├── utils/        # Analytics engine, AI engine, formatters
│   │   └── types/        # TypeScript interfaces
│   └── .env.example
└── backend/           # FastAPI scaffold (for you to implement)
    ├── app/
    ├── requirements.txt
    └── SETUP.md       # PostgreSQL + pgAdmin guide
```

## Features

- **Dashboard** — Income, expenses, balance, savings rate, charts
- **Expense Management** — Add/edit/delete income & expenses with filters
- **Analytics** — Pie, bar, line, area charts + spending heatmap
- **Export** — PDF, Excel, CSV, JSON, TXT, DOCX
- **AI Insights** — Local AI assistant for spending analysis
- **Themes** — Dark/light mode + custom colors
- **Backup** — JSON import/export
- **Mobile-first** — Bottom nav, sticky summary, swipe-friendly cards

## Backend Setup

See [backend/SETUP.md](backend/SETUP.md) for PostgreSQL, pgAdmin, and FastAPI instructions.
