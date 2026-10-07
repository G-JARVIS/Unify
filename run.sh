#!/usr/bin/env bash
# Starts all UNIFY services. Ctrl+C stops everything.
#   Express API  (Firestore CRUD)       http://localhost:5000
#   FastAPI      (COMS + chatbot, AI)   http://127.0.0.1:8000
#   Frontend     (Vite)                 http://localhost:5173
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
PIDS=()
trap 'kill "${PIDS[@]}" 2>/dev/null' EXIT INT TERM

cd "$ROOT/unify/backend"
[ -d node_modules ] || npm install
[ -e .env ] || ln -s ../../backend/.env .env   # shares backend/.env
npm run dev &
PIDS+=($!)

cd "$ROOT/backend"
set -a; . ./.env; set +a
python3 -m uvicorn app.main:app --reload --port 8000 &
PIDS+=($!)

cd "$ROOT/frontend"
[ -d node_modules ] || npm install --legacy-peer-deps
npm run dev
