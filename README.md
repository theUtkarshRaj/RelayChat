# 💬 RelayChat

A **real-time chat application** built with a **microservices architecture**, featuring email-based OTP authentication, live messaging, image sharing, typing indicators, and online presence tracking.

---

## 🧩 Problem It Solves

Traditional chat apps bundle all logic into a single monolith, making them hard to scale and maintain. **RelayChat** separates concerns into independent services — a **User Service**, a **Chat Service**, and a **Mail Service** — each deployable and scalable independently.

---

## ✨ Key Features

- 📧 **Email OTP Login** — Passwordless authentication via 6-digit OTP sent to email
- ⚡ **Real-time Messaging** — Instant delivery via Socket.IO
- 🖼️ **Image Sharing** — Upload and send images via Cloudinary
- ✅ **Read Receipts** — Messages are marked as seen with timestamps
- 🟢 **Online Presence** — See which users are currently online
- ⌨️ **Typing Indicators** — Live "user is typing..." feedback
- 🔐 **JWT Authentication** — Stateless auth with 15-day token expiry
- 🚦 **OTP Rate Limiting** — Redis-backed 1 OTP per email per minute
- 👤 **Profile Management** — Update your display name

---

## 🛠️ Tech Stack

| Layer        | Technology                                             |
|--------------|--------------------------------------------------------|
| Frontend     | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend      | Node.js, Express.js v5, TypeScript                     |
| Real-time    | Socket.IO                                              |
| Database     | MongoDB (Mongoose)                                     |
| Cache / Rate Limit | Redis (Upstash)                                  |
| Message Queue | RabbitMQ (via AMQP / Docker)                          |
| Email        | Nodemailer (Gmail SMTP)                                |
| Media Upload | Cloudinary + Multer                                    |
| Auth         | JWT (jsonwebtoken)                                    |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────┐
│        Next.js Frontend         │
│  (Login → Verify → Chat Page)   │
└───────┬──────────┬──────────────┘
        │ HTTP     │ WebSocket (Socket.IO)
        ▼          ▼
┌──────────────┐  ┌──────────────────┐
│  User Service│  │   Chat Service   │
│  (Port 5000) │  │   (Port 5002)    │
│              │  │                  │
│  MongoDB     │  │  MongoDB         │
│  Redis       │  │  Socket.IO       │
│  RabbitMQ    │  │  Cloudinary      │
└──────┬───────┘  └──────────────────┘
       │ publishes to queue
       ▼
┌──────────────┐
│  Mail Service│  ← consumes RabbitMQ queue
│  (Port 3001) │     sends OTP via Gmail SMTP
└──────────────┘
```

The **Chat Service** makes internal HTTP calls to the **User Service** (via `axios`) to fetch user profile data when loading chats and messages.

---

## 📁 Project Folder Structure

```
Chat App/
├── backend/
│   ├── user/                    # User Service (Port 5000)
│   │   └── src/
│   │       ├── index.ts         # Express app entry, Redis + RabbitMQ setup
│   │       ├── config/
│   │       │   ├── db.ts        # MongoDB connection
│   │       │   ├── rabbitmq.ts  # RabbitMQ publisher
│   │       │   ├── generateToken.ts  # JWT generator
│   │       │   └── tryCatch.ts  # Global error wrapper
│   │       ├── model/user.ts    # User schema (name, email)
│   │       ├── controllers/user.ts  # loginUser, verifyUser, myProfile, updateName, ...
│   │       ├── middleware/isauth.ts # JWT auth middleware
│   │       └── routes/user.ts   # Route definitions
│   │
│   ├── chat/                    # Chat Service (Port 5002)
│   │   └── src/
│   │       ├── index.ts         # Express app entry
│   │       ├── config/
│   │       │   ├── db.ts        # MongoDB connection
│   │       │   ├── socket.ts    # Socket.IO server setup
│   │       │   └── cloudinary.ts # Cloudinary config
│   │       ├── models/
│   │       │   ├── chat.ts      # Chat schema (users[], latestMessage)
│   │       │   └── messages.ts  # Message schema (text/image, seen, seenAt)
│   │       ├── controllers/chat.ts  # createNewChat, getAllChats, sendMessage, getMessagesByChat
│   │       ├── middlewares/
│   │       │   ├── isAuth.ts    # JWT auth middleware
│   │       │   └── multer.ts    # Cloudinary-backed file upload
│   │       └── routes/chat.ts   # Route definitions
│   │
│   └── mail/                    # Mail Service (Port 3001)
│       └── src/
│           ├── index.ts         # Express app entry
│           └── consumer.ts      # RabbitMQ consumer → Nodemailer email sender
│
└── frontend/                    # Next.js App
    └── app/
        ├── layout.tsx           # Root layout (AppProvider + SocketProvider)
        ├── page.tsx             # Root redirect
        ├── login/page.tsx       # Email input page
        ├── verify/page.tsx      # OTP verification page
        ├── chat/page.tsx        # Main chat interface
        ├── profile/page.tsx     # Profile/name edit page
        ├── context/
        │   ├── appContext.tsx   # Global state (user, chats, auth)
        │   └── SocketContext.tsx # Socket.IO client provider
        └── components/
            ├── ChatSidebar.tsx  # Chat list + user list panel
            ├── ChatHeader.tsx   # Active chat header + typing indicator
            ├── ChatMessages.tsx # Message bubbles with seen receipts
            ├── MessageInput.tsx # Text + image upload input
            ├── verifyOtp.tsx    # 6-digit OTP input logic
            └── Loading.tsx      # Loading spinner
```

---

## ⚙️ Installation

### Prerequisites

- Node.js ≥ 18
- Docker (for RabbitMQ)
- MongoDB (Atlas or local)
- Redis (Upstash or local)
- Cloudinary account
- Gmail account (with App Password)

### Step 1 — Clone the repo

```bash
git clone https://github.com/theUtkarshRaj/RelayChat.git
cd "Chat App"
```

### Step 2 — Start RabbitMQ via Docker

```bash
docker run -d --hostname rabbitmq-host --name rabbitmq-container \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```

### Step 3 — Install dependencies

```bash
# User Service
cd backend/user && npm install

# Chat Service
cd ../chat && npm install

# Mail Service
cd ../mail && npm install

# Frontend
cd ../../frontend && npm install
```

---

## 🔐 Environment Variables

### `backend/user/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
REDIS_URL=redis://<upstash-url>
JWT_SECRET=your_jwt_secret
Rabbitmq_Host=localhost
Rabbitmq_Username=admin
Rabbitmq_Password=admin123
```

### `backend/chat/.env`

```env
PORT=5002
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
JWT_SECRET=your_jwt_secret
USER_SERVICE=http://localhost:5000
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

### `backend/mail/.env`

```env
port=3001
Rabbitmq_Host=localhost
Rabbitmq_Username=admin
Rabbitmq_Password=admin123
USER=your_gmail@gmail.com
PASSWORD=your_gmail_app_password
```

> ⚠️ Use a **Gmail App Password** (not your regular Gmail password). Enable 2FA on your Google account and generate an App Password.

---

## 🚀 Running the Project

Open **4 terminals** simultaneously:

```bash
# Terminal 1 — User Service
cd backend/user
npm run dev

# Terminal 2 — Chat Service
cd backend/chat
npm run dev

# Terminal 3 — Mail Service
cd backend/mail
npm run dev

# Terminal 4 — Frontend
cd frontend
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 📡 API Overview

### User Service (`localhost:5000/api/v1`)

| Method | Route            | Auth | Description                          |
|--------|------------------|------|--------------------------------------|
| POST   | `/login`         | ❌   | Send OTP to email                    |
| POST   | `/verify`        | ❌   | Verify OTP, return JWT + user        |
| GET    | `/me`            | ✅   | Get logged-in user profile           |
| GET    | `/user/all`      | ✅   | Get all users                        |
| GET    | `/user/:id`      | ❌   | Get single user by ID                |
| POST   | `/update/user`   | ✅   | Update display name                  |

### Chat Service (`localhost:5002/api/v1`)

| Method | Route                  | Auth | Description                          |
|--------|------------------------|------|--------------------------------------|
| POST   | `/chat/new`            | ✅   | Create or fetch a 1-to-1 chat        |
| GET    | `/chat/all`            | ✅   | Get all chats for logged-in user     |
| POST   | `/message`             | ✅   | Send a text or image message         |
| GET    | `/message/:chatId`     | ✅   | Get all messages in a chat           |

### Socket.IO Events (Chat Service, Port 5002)

| Event (emit)  | Direction      | Description                  |
|---------------|----------------|------------------------------|
| `joinChat`    | Client → Server | Join a chat room             |
| `leaveChat`   | Client → Server | Leave a chat room            |
| `typing`      | Client → Server | Notify typing started        |
| `stopTyping`  | Client → Server | Notify typing stopped        |
| `newMessage`  | Server → Client | Broadcast new message        |
| `messagesSeen`| Server → Client | Notify messages marked seen  |
| `getOnlineUser`| Server → Client | Broadcast online users list |
| `userTyping`  | Server → Client | Broadcast typing event       |

---

## 🖼️ UI Description

- **Login Page** — Dark themed, email-only input with a blue submit button to send OTP
- **Verify Page** — 6 individual OTP digit boxes with auto-focus, paste support, and a 60-second resend timer
- **Chat Page** — Two-panel layout: left sidebar (chats / all-users toggle) and right message area with header, message bubbles, and input bar
- **Profile Page** — Shows current name with an edit form to update it

---

## 🔮 Future Improvements

- [ ] Group chat support
- [ ] Voice / video calling (WebRTC)
- [ ] Push notifications (FCM)
- [ ] Message deletion / editing
- [ ] End-to-end encryption
- [ ] Docker Compose for one-command startup
- [ ] CI/CD pipeline
- [ ] Profile picture upload
- [ ] Search messages

---

## 👤 Author

**Utkarsh Raj**
GitHub: [@theUtkarshRaj](https://github.com/theUtkarshRaj)
