# Signal Clone - SDE Fullstack Assignment

A fully functional, real-time messaging platform replicating the core design, user experience, and workflows of the Signal messenger.

**Live Demo**: [https://anudeep-scaler.vercel.app](https://anudeep-scaler.vercel.app) (Frontend) / Railway (Backend)

---

## 🚀 Features

### Core Implementation
- **Authentication**: Phone-number based mocked OTP registration and session persistence.
- **One-on-One Messaging**: Real-time direct messaging with WebSockets.
- **Group Messaging**: Create groups, add/remove members, and rename groups (Admin controls).
- **Signal UI/UX**: Closely resembles Signal’s desktop and mobile layouts, with accurate threading, bubbles, and typography.
- **Real-Time Indicators**: Typing indicators, single/double tick delivery receipts, and online/offline status rendering.
- **Persistent Data**: SQLite database strictly managing users, messages, and conversations.

### Bonus / Advanced Features
- **File Attachments**: Upload and send images/documents in chats.
- **Replies & Quoted Messages**: Reply to specific messages with contextual previews.
- **Disappearing Messages**: Fully functional message expiration logic.
- **Message Reactions**: React to any message with emojis.
- **Dark Mode**: Persisted dark/light theme toggle.
- **Responsive Design**: Flawless layout shifting for mobile, tablet, and desktop views.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with TailwindCSS for utility classes
- **State Management**: Zustand
- **Icons**: Lucide React
- **Hosting**: Vercel

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite
- **ORM**: SQLAlchemy
- **Real-Time**: WebSockets (FastAPI native)
- **Authentication**: PyJWT for stateless token sessions
- **Hosting**: Railway / Render (Dockerized)

---

## 🏗️ Architecture Overview

The application follows a decoupled client-server architecture. 

**Backend (FastAPI)**:
- Follows a strict **Controller-Service-Repository** pattern.
  - **Controllers (Routers)**: Handle HTTP parsing and validation (Pydantic).
  - **Services**: Contain all core business logic (creating chats, formatting replies).
  - **Repositories**: The only layer that executes SQLAlchemy database queries.
- **WebSocket Manager**: A central hub manages active WebSocket connections. When a message is saved to the DB via an HTTP POST request, the backend triggers a WebSocket broadcast event (`message.created`, `typing`, etc.) to the recipient's active socket.

**Frontend (Next.js)**:
- Built as an SPA within Next.js App Router (`use client`).
- Uses **Zustand** as a global store to cache conversations, messages, and handle WebSocket socket events.
- **Optimistic UI Updates**: When a user sends a message, it renders instantly with a "Sending" status before the server confirms it, ensuring a snappy, Signal-like experience.

---

## 🗄️ Database Schema

The database relies on a relational SQLite schema. 

1. **Users**
   - `id` (PK), `phone` (Unique), `username` (Unique), `display_name`, `avatar_url`, `created_at`
2. **Conversations**
   - `id` (PK), `type` (ENUM: DIRECT, GROUP), `name` (for groups), `avatar_url`
3. **ConversationParticipants (Many-to-Many Join Table)**
   - `conversation_id` (FK), `user_id` (FK), `joined_at`
4. **Messages**
   - `id` (PK), `conversation_id` (FK), `sender_id` (FK), `content`, `attachment_url`, `message_type` (TEXT, IMAGE, FILE)
   - `reply_to` (FK -> Messages.id)
   - `expires_at` (Timestamp for disappearing messages)
   - `status` (ENUM: SENT, DELIVERED, READ)
5. **Reactions**
   - `id` (PK), `message_id` (FK), `user_id` (FK), `emoji`

---

## 🔌 API Overview

### Authentication
- `POST /api/auth/register` - Create user or login with phone + OTP.
- `GET /api/auth/me` - Fetch current user profile.

### Users
- `GET /api/users/search?q={query}` - Search users by name/phone to start a new chat.

### Conversations & Groups
- `GET /api/conversations` - List all active chats.
- `POST /api/conversations/direct` - Start a 1-on-1 chat.
- `POST /api/groups` - Create a new group chat.
- `PATCH /api/groups/{id}` - Rename group.
- `POST /api/groups/{id}/members` - Add member to group.
- `DELETE /api/groups/{id}/members/{user_id}` - Remove member.

### Messages
- `GET /api/conversations/{id}/messages` - Fetch message history.
- `POST /api/conversations/{id}/messages` - Send a text or attachment message.
- `POST /api/conversations/{id}/read` - Mark unread messages as read.
- `POST /api/messages/{id}/reactions` - Add emoji reaction.

### WebSockets
- `ws /ws/conversations/{id}` - Real-time stream for typing indicators and incoming messages.

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.11+)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

pip install -r requirements.txt

# Run the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*The database will auto-generate in `backend/database/database.db` on first boot.*

### Frontend Setup
```bash
cd frontend
npm install

# Create environment variable
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local

# Run the frontend
npm run dev
```

---

## 🧠 Assumptions & Design Decisions
1. **Mocked Encryption**: True Signal E2E encryption requires complex client-side WebCrypto key exchange. For this assignment, messages are stored in plain text on the server, and encryption is treated as "mocked".
2. **Ephemeral File Storage**: For attachments, the backend saves files to the local disk (`/uploads`). If deployed on an ephemeral service (like Railway free tier), attachments uploaded in previous sessions may 404 upon container restart. In a real-world scenario, this would map to an AWS S3 bucket.
3. **Phone Number Visibility**: To strictly emulate Signal, users authenticate via phone number. However, phone numbers are omitted from general display areas in favor of strictly name-based identification, maximizing privacy.
