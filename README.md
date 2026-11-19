# UNIFY

UNIFY is a procurement and collaboration platform for micro, small, and medium
enterprises (MSMEs). It brings business opportunities, government tenders and
contracts, applications, supply-chain requests, collaborations, and AI-assisted
matching into one workspace.

This repository currently contains two React applications and two API services:
the UNIFY portal, and a second AI-enabled dashboard with a dedicated matching
and chat service.

## Features

- Browse procurement opportunities, government tenders, and contract awards.
- Submit and track applications and incoming requests.
- Discover supply-chain opportunities and collaboration projects.
- Use COMS (Capability-Opportunity Matching Score) to rank opportunities
  against a company's capabilities.
- Ask the AI assistant questions about platform data and workflows.
- Manage company profiles, messages, notifications, and subscriptions.
- Review admin pages for government contracts and tenders.
- View the mediation process. Live mediation case and escrow records are not
  currently connected to a case-management API.

## Applications and services

| Component | Directory | Local address | Purpose |
| --- | --- | --- | --- |
| AI-enabled dashboard | `frontend/` | http://localhost:5173 | Main React dashboard; uses the Express API and FastAPI AI service. |
| FastAPI service | `backend/` | http://127.0.0.1:8000 | Firebase-authenticated COMS matching, company profile lookup, and streaming assistant API. |
| UNIFY portal | `unify/frontend/` | http://localhost:8081 | React portal for opportunities, applications, tenders, collaborations, and account features. |
| Express API | `unify/backend/` | http://localhost:5000 | Firebase Authentication and Firestore-backed application API. |

The FastAPI API documentation is available at
http://127.0.0.1:8000/docs. The Express health endpoint is
http://localhost:5000/api/health.

The AI-enabled dashboard defaults to an Express URL on port `5001`. The
included Express API defaults to port `5000`; set `VITE_API_URL` in
`frontend/.env.local` to `http://localhost:5000/api` when using this API.

## Repository layout

```text
backend/                 FastAPI AI service and its Python support modules
docs/                    Product, architecture, API, design, and testing notes
frontend/                AI-enabled React dashboard (Vite)
unify/backend/           Express API backed by Firebase REST APIs
unify/firestore.rules    Firestore security rules
unify/frontend/          UNIFY React portal (Vite)
```

## Prerequisites

- Node.js 22.12 or newer and npm.
- Python 3.10 or newer.
- A Firebase project with Email/Password Authentication enabled and Firestore
  configured.
- A Groq API key if you want to enable hosted AI chat responses. Some AI
  embedding paths can also use an OpenAI API key as a fallback.

## Configure local environment

Do not commit `.env` files or credentials. The repository ignores local
environment files.

### Firebase project values

Create a Firebase web app and use its project settings for the client
configuration. The Firebase web app values are:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Create `unify/backend/.env` from the checked-in template:

```powershell
Copy-Item unify\backend\.env.example unify\backend\.env
```

Set at least `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY`. The template sets
`PORT=5000`. Set `ADMIN_EMAILS` to a comma-separated list of administrator
accounts if needed. `ADMIN_SEED_PASSWORD` is only used by the optional seed
script.

Create `unify/frontend/.env.local` with the Firebase web app values and the
Express API URL:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

Create `backend/.env` from its template for the FastAPI service:

```powershell
Copy-Item backend\.env.example backend\.env
```

Set `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY` here as well. You may set
`GROQ_API_KEY` to enable the assistant and `GROQ_MODEL` to override its default
model (`openai/gpt-oss-120b`). The Python service reads Firebase and Groq
settings from this file; its local server port is set by the Uvicorn command,
not by `PORT` in the example file.

Create `frontend/.env.local` with the Firebase web app values and service URLs:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_AI_URL=http://127.0.0.1:8000/api/v1
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

`VITE_API_URL` and `VITE_AI_URL` have defaults, but setting them explicitly
helps keep the two APIs distinct. Firebase client configuration is not a
replacement for Firestore security rules; configure and review
`unify/firestore.rules` for your Firebase project.

## Run locally

Install dependencies and run each service in a separate terminal from the
repository root.

### 1. Start the Express API

```powershell
cd unify\backend
npm ci
npm run dev
```

Check `http://localhost:5000/api/health`.

### 2. Start the FastAPI AI service

In another terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000/docs for the interactive API documentation.
Sentence-transformer embeddings may be downloaded the first time COMS matching
needs them. If that model cannot be used, the embedding service can fall back
to OpenAI embeddings when `OPENAI_API_KEY` is available in the process
environment.

### 3. Start the UNIFY portal

In another terminal:

```powershell
cd unify\frontend
npm ci
npm run dev
```

Open http://localhost:8081.

### 4. Start the AI-enabled dashboard

In another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173.

The dashboard uses Firebase Authentication, the Express API for platform data,
and FastAPI for AI matching and chat. The UNIFY portal uses Firebase
Authentication and the Express API.

## API overview

### Express API

The Express service exposes `/api/health` and routes for:

- Authentication and company profiles.
- Opportunities and applications.
- Supply-chain requests and collaborations.
- Government contracts and tenders.
- Conversations, notifications, and the assistant.

The API uses Firebase REST APIs and Firestore; no Firebase Admin service-account
file is required by the current implementation.

### FastAPI AI service

The FastAPI service is mounted under `/api/v1` and currently provides:

- `GET /api/v1/profiles/me` — the authenticated company's Firestore profile.
- `POST /api/v1/match/opportunities` — COMS opportunity ranking.
- `POST /api/v1/chat/stream` — authenticated server-sent-event chat.

Requests to these endpoints require a Firebase ID token in the `Authorization`
header.

## Development checks

Run the frontend checks from the corresponding frontend directory:

```powershell
npm test
npm run lint
npm run build
```

Both `frontend/` and `unify/frontend/` provide these scripts. The Express
backend provides `npm run dev`, `npm start`, and an optional `npm run seed`
script; review its requirements and environment variables before using the seed
script with a Firebase project.

## Project documentation

The [`docs/`](docs/) directory contains the product requirements, architecture,
database, API, AI-agent, design-system, phase, testing, and deployment notes.

## Security and deployment notes

- Keep private keys, passwords, and local `.env` files out of version control.
- Configure Firestore rules and Firebase Authentication for the intended
  users; never rely on client-side checks as the only access control.
- Restrict CORS origins and use HTTPS when deploying services.
- `VITE_*` values are included in browser bundles. Do not put server secrets in
  frontend environment files.
- The checked-in Firebase web API key is a client identifier, not a server
  secret; protect data with Firebase rules and authentication.
