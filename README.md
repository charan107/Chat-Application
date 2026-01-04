# AI Powered Chat Application 💬

A modern, responsive chat application focused on **clean UI**, **smooth interactions**, and a **scalable foundation** for real-time and AI features.

---

## ✨ Core Features

### Chat
- One-to-one chat interface
- Sidebar with chat list
- Chat filtering:
  - All
  - Unread
  - Favourites
- Message send & receive UI
- Sent / received message styling
- Message selection mode with bulk actions
- Context menus (three-dot actions)
- Attachment popup UI

---

### Voice & Video Call (UI)
- Voice call window (floating, independent overlay)
- Video call mode using same call window
- Medium-sized centered call window
- Minimize call to top-right compact view
- Fullscreen toggle with smooth animation
- End call action
- Active state indicators for call controls

*(UI only — media logic to be integrated later)*

---

### UI & UX
- Fully dark theme using CSS variables
- Consistent color grading across app
- Smooth hover & transition effects
- Responsive layout:
  - Mobile
  - Tablet
  - Desktop
- Sidebar → Chat navigation with back support
- Hidden scrollbars for clean chat experience

---

### State & Data Handling
- Global state using React Context
- Local persistence using `localStorage`
- Chats, messages, unread counts handled locally
- Offline-first behavior (no backend dependency yet)

---

## 🧠 Tech Stack

- React (Vite)
- Context API
- Custom Hooks
- CSS Variables
- React Icons

---

## 📂 Project Setup

```bash
git clone https://github.com/your-username/ai-powered-chat-app.git
cd ai-powered-chat-app
npm install
npm run dev
