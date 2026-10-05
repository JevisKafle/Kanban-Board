# Kanban Board

A full-stack Kanban board application for organizing work into boards, columns, and cards. It includes drag-and-drop card and column ordering, card descriptions, board membership, and live board updates over WebSockets.

## Features

- Register, log in, and manage a user session
- Create and manage boards, columns, and cards
- Drag and drop cards between columns and reorder columns
- Share boards with members and assign roles
- Receive live updates when board content changes

## Tech stack

- **Frontend:** React, TypeScript, TanStack Start/Router/Query, Tailwind CSS, dnd-kit
- **Backend:** Django, Django REST Framework, Django Channels
- **Data and realtime:** SQLite and Redis

## Requirements

- Python 3.12 or newer
- Node.js and pnpm
- Docker Desktop or Docker Engine with the Compose plugin (for Redis)

## Run locally

Open separate terminals for the backend and frontend.

### 1. Start Redis

From the repository root:

```sh
cd backend
docker compose up -d redis
```

Redis is used by Django Channels to deliver live board updates.

### 2. Configure and start the backend

From `backend/`, create and activate a virtual environment, then install the dependencies:

**Windows PowerShell**

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

**macOS/Linux**

```sh
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Create a `backend/.env` file and set a local Django secret key:

```dotenv
SECRET_KEY=replace-this-with-a-long-random-development-only-value
```

Apply database migrations and start Django:

```sh
python manage.py migrate
python manage.py runserver 8000
```

The backend API is available at `http://localhost:8000/api/`.

### 3. Configure and start the frontend

In a new terminal, from the repository root:

```sh
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000` in your browser. The frontend currently connects to the backend at `http://localhost:8000` and its board WebSockets at `ws://localhost:8000`.

## Development commands

Run these commands from the relevant app directory:

| App | Command | Description |
| --- | --- | --- |
| Frontend | `pnpm dev` | Start the frontend development server |
| Frontend | `pnpm build` | Build the frontend for production |
| Frontend | `pnpm preview` | Preview the production frontend build |
| Backend | `python manage.py test` | Run the Django test suite |
| Backend | `python manage.py migrate` | Apply database migrations |

## Project structure

```text
backend/   Django API, authentication, board models, and WebSocket support
frontend/  React application and board interface
```

## Deployment and security

The checked-in configuration is intended for local development. Before deploying publicly, configure production Django settings, including `DEBUG`, `ALLOWED_HOSTS`, trusted origins, secure cookies, and a strong secret key. Also configure the frontend API and WebSocket endpoints for the deployed backend, and use a production database and Redis service. Never publish a real `.env` file or secret key.
