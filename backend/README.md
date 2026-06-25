# Signal Clone Backend

FastAPI + SQLite backend for the Signal-style messaging assignment.

## Run

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API starts at `http://localhost:8000`, docs at `/docs`, and health at `/health`.

## Mock Auth

Use the fixed OTP `123456`.

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Protected routes accept `Authorization: Bearer <token>`. For fast mocked UIs they also accept `X-User-Id: 1`.

## Architecture

Routes call services, services call repositories, repositories are the only layer that talks to SQLAlchemy. WebSocket events are published through one connection manager.

## Core API

- Users: search, read profile, update profile
- Contacts: add, list, remove
- Conversations: create direct chat, list, get detail
- Groups: create, rename, add/remove members
- Messages: send/list, delivery/read receipts, typing over WebSocket
- Bonus: uploads, reactions, replies, disappearing messages

## WebSocket

- `/ws/conversations/{conversation_id}` for message and typing events
- `/ws/users/{user_id}` for user-scoped events

## Seed Data

On first startup SQLite is created and seeded with four users, a direct conversation, a group, and sample messages.
