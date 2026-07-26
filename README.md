# 🚀 PostPulse — AI Social Media Scheduler & Meta Auto-Publisher

> **PostPulse** is a production-grade, multi-account social media scheduling and automation platform built with **FastAPI**, **MongoDB / Motor**, **APScheduler**, **Google Gemini AI**, and **React**. It empowers digital creators, agency teams, and brands to generate high-converting social copy, schedule posts in advance, and automatically publish across **Meta APIs (Facebook Pages & Instagram Business Profiles)**.

---

## 🔥 Key Features & System Capabilities

- **🤖 AI Content Studio (Gemini Engine)**: Generate multi-tone copy (Professional, Casual, Punchy, Viral, Educational, Sales), hashtag clusters, platform-adapted variants (Facebook long-form vs Instagram visual-first), and AI image prompts.
- **📅 Interactive Visual Calendar & Scheduler**: Drag-and-drop / weekly & monthly schedule grid with live status tracking (`Draft`, `Scheduled`, `Publishing`, `Published`, `Failed`).
- **🌐 Meta Graph API Auto-Publisher (v19.0+)**:
  - **Facebook Page API**: Publishes text feed posts, photo posts, and link previews.
  - **Instagram Business Graph API**: Two-phase media container creation & publishing workflow.
  - **Dual-Mode Adapter**: Supports both **Live Meta Credentials** and a zero-config **Sandbox Mock Mode** so developers can evaluate publishing pipelines immediately.
- **⏱️ Async Background Task Scheduler (APScheduler)**: Polling queue engine that automatically checks scheduled posts every 30 seconds and triggers publication upon time arrival.
- **📊 Multi-Account Management & Analytics Dashboard**: Unified overview of connected Facebook Pages, Instagram Profiles, volume velocity charts, and platform distribution.

---

## 🏛️ Tech Stack Architecture

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Motor / PyMongo (Async MongoDB with fallback memory store), APScheduler, PyJWT, Google Generative AI (`google-generativeai`), HTTPX.
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts, Axios, Date-fns.
- **API Spec**: RESTful JSON endpoints with JWT Bearer Authentication.

---

## ⚡ Quick Start Guide (Local Development)

### 1. Clone / Workspace Location
The codebase is located at:
`C:\Users\vivek\.gemini\antigravity\scratch\postpulse`

### 2. Backend Setup (FastAPI & Scheduler)
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
venv\Scripts\activate  # On Windows

# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- Interactive API Documentation: Open [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup (React Dashboard)
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start Vite local development server
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) in Google Chrome.

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the `backend/` directory:

```env
# JWT & Security
JWT_SECRET=super-secret-postpulse-jwt-key-2026

# Database (MongoDB connection URL)
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=postpulse_db

# Google Gemini AI Key (Optional - Fallback engine active if omitted)
GEMINI_API_KEY=your_gemini_api_key_here

# Meta Graph API Credentials (Facebook & Instagram)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_API_VERSION=v19.0

# Set to 'true' for local sandbox testing without approved Meta credentials
USE_MOCK_META=true
```

---

## 👨‍💻 Evaluation Credentials & Demo Access

For zero-friction testing:
- Launch the web app at `http://localhost:3000` and click **"Quick 1-Click Evaluator Demo Access"**.
- Default Demo Account:
  - **Email**: `developer@postpulse.ai`
  - **Password**: `demo1234`

---

## 🏆 Project Evaluation Highlights

1. **Code Architecture**: Modular backend routers (`auth`, `accounts`, `posts`, `ai`, `analytics`) and clear service isolation (`meta_service.py`, `ai_service.py`, `scheduler_service.py`).
2. **Resilience**: Zero setup failure guarantee with dual-mode database manager (MongoDB + Memory fallback store) and Meta Graph API adapter (Live + Mock Sandbox).
3. **User Experience (UI/UX)**: Glassmorphic dark design, responsive layout, live Facebook & Instagram preview cards, and instant AI copy enhancement.
