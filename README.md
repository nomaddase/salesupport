# AI-driven Web CRM Platform

This repository contains a prototype implementation of an AI-assisted CRM platform composed of a FastAPI backend and a Next.js frontend. The backend exposes REST and WebSocket interfaces, integrates a placeholder AI decision engine, and prepares Celery + Redis infrastructure for background tasks and push notifications. The frontend provides a responsive dashboard shell that consumes the backend API and WebSocket events.

## Project Structure

- `backend/` – FastAPI application with SQLAlchemy models, JWT authentication, AI service stubs, push notifications via Celery, and Docker configuration.
- `frontend/` – Next.js dashboard with Tailwind CSS, Socket.IO client, and Zustand state management.
- `docker-compose.yml` – Development orchestration for backend, PostgreSQL, Redis, and Celery worker services.

## Getting Started

1. Copy environment templates and adjust values:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```
2. Build and start services:
   ```bash
   docker-compose up --build
   ```
3. Access the FastAPI docs at `http://localhost:8000/docs` and the Next.js app at `http://localhost:3000` (after running `npm install && npm run dev` inside `frontend/`).

## Backend Tooling

- Python 3.11
- FastAPI, SQLAlchemy, Celery, Redis, FastAPI-SocketIO
- JWT authentication utilities and placeholder AI engine hooks

## Frontend Tooling

- Next.js 14
- Tailwind CSS
- React Query + Zustand for state
- Socket.IO client for real-time updates

## Testing the Health Endpoint

After starting the stack, verify the backend is running:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status": "ok"}
```

## Notes

- The AI engine currently returns deterministic placeholder responses to keep the project self-contained.
- Push notifications rely on Celery tasks and require VAPID keys to be configured in the environment.
