# IFRS Reports App

A full‑stack IFRS reporting and data explorer application.

- Frontend: React + TypeScript + Vite + MUI
- Backend: Node.js + Express + TypeScript
- Database: Microsoft SQL Server via `mssql/msnodesqlv8`

The app provides:
- Authentication (JWT)
- A configurable sidebar to select database-backed reports/tables
- A dynamic data table with pagination, sorting, searching, uppercase headers, and date formatting

## Project Structure

```
ifrs/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/       # Auth and DB explorer controllers
│  │  ├─ database/          # Schema scripts (e.g., schema.sql)
│  │  ├─ middleware/        # Error handling, validation, auth
│  │  ├─ routes/            # /api/auth and /api/db routes
│  │  ├─ server.ts          # Express app entry
│  │  └─ db.ts              # SQL Server connection (msnodesqlv8)
│  ├─ .env.example          # Sample environment variables
│  └─ create-schema.js      # Helper script to create schema from schema.sql
├─ frontend/
│  ├─ src/
│  │  ├─ components/        # UI (Dashboard, Sidebar, DataTable, etc.)
│  │  ├─ config/            # Sidebar config for DB tables
│  │  └─ services/          # API client (Auth, DB explorer)
│  └─ vite.config.ts
├─ package.json             # Root helper scripts
└─ README.md
```

## Prerequisites

- Node.js 18+ and npm
- Microsoft SQL Server reachable from your machine
- Windows environment recommended (project uses `msnodesqlv8` driver with Trusted Connection by default)

## Installation

Install dependencies in all three places (root, backend, frontend):

```bash
# From project root
npm install                # installs root dev tools (e.g. npm-run-all)

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Environment Variables

Backend uses `.env`. Start by copying the sample file and adjust values:

```bash
cd backend
cp .env.example .env  # On Windows PowerShell: Copy-Item .env.example .env
```

Recommended values for local development:

```
# Database (Trusted Connection)
DB_SERVER=localhost
DB_DATABASE=IFRS
DB_TRUSTED_CONNECTION=true

# JWT
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3333               # Backend defaults to 3333 if not set
NODE_ENV=development

# Security
BCRYPT_ROUNDS=12

# (Optional) Email for password reset flows
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@ifrs.com
```

Frontend can optionally point at a non-default API host via `.env`:

```
# frontend/.env (optional)
VITE_API_URL=http://localhost:3333/api
```

If not set, the frontend defaults to `http://localhost:3333/api`.

## Database Setup (Optional Helper)

If you need to create local tables (Users, PasswordResetTokens, IFRS tables, etc.), you can use the helper script which executes `backend/src/database/schema.sql`:

```bash
cd backend
node create-schema.js
```

Make sure your `.env` is configured before running this script. You can also manage your schema manually if you prefer.

## Running the App

You can run backend and frontend separately or together.

Option A: Run both from the root (parallel):

```bash
# From project root
npm run dev
```

- Backend: http://localhost:3333/
- Frontend: http://localhost:5173/ (Vite chooses 5173 by default; if busy it may pick 5174)

Option B: Run each individually:

```bash
# Backend
cd backend
npm run dev
# -> http://localhost:3333/

# Frontend
cd ../frontend
npm run dev
# -> http://localhost:5173/ (use: npm run dev -- --port 5174 to force a port)
```

## API Overview

Base URL: `http://localhost:3333/api`

Auth routes:
- POST `/auth/register` — Register user
- POST `/auth/login` — Login, returns JWT
- POST `/auth/forgot-password` — Request password reset
- POST `/auth/reset-password` — Reset password with token
- GET `/auth/profile` — Current user (requires Authorization: Bearer <token>)

DB explorer routes (all require Authorization):
- GET `/db/tables` — List tables/views
- GET `/db/tables/:tableId/columns` — Column metadata
- GET `/db/tables/:tableId/rows` — Paginated rows with optional `page`, `pageSize`, `sort`, `order`, `search`

## Frontend Features

- React + Vite + MUI layout
- Sidebar with configurable DB-backed entries
- Data table with:
  - Server-driven pagination, sorting, and search
  - Uppercase header styling
  - IFRS-specific formatting (e.g., `PositionAsAt` shown as DD/MM/YYYY when present)

### Configure Which Tables Appear in the Sidebar

Edit `frontend/src/config/sidebarTables.ts` to define the backend tables and their display names. Example:

```ts
export const DB_SIDEBAR_TABLES = [
  {
    id: 'ifrs_trial_balance',               // unique ID used in routing/requests
    label: 'IFRS Trial Balance',            // display name in the sidebar and page title
    table: 'dbo.ifrs_trial_balance'         // fully qualified table/view name in SQL Server
  },
  // Add more entries here…
];
```

The dashboard reads this configuration to build the menu and map IDs to fully qualified table names for the DB explorer endpoints.

## Building for Production

Backend:

```bash
cd backend
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run build
npm run preview   # local static preview
```

Serve the frontend build output (dist) from your preferred static host or reverse proxy. Set `VITE_API_URL` at build time if your API is not on `http://localhost:3333/api`.

## Troubleshooting

- net::ERR_CONNECTION_REFUSED to `/api/...`: Make sure the backend is running on the expected port (default 3333) and your frontend `VITE_API_URL` matches.
- Port already in use (5173/5174): Run Vite on a different port, e.g. `npm run dev -- --port 5174`.
- SQL connection issues: Verify SQL Server is reachable and that `DB_SERVER`, `DB_DATABASE`, and `DB_TRUSTED_CONNECTION` in `.env` are correct.
- Browser extension console errors (e.g., `quillbot-content.js` TypeError) are unrelated to the app and can be ignored.

## License

ISC
