# 🌐 PostPulse Production Deployment Guide

This guide walks you through deploying **PostPulse** using **Vercel** for the React Frontend and **Render** (or **Railway**) for the FastAPI Backend.

---

## 🛠️ Step 1: Deploy Backend (Render or Railway)

### Option A: Render (Free Web Service)
1. Push your repository to **GitHub**.
2. Log into [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables under **Environment**:
   - `JWT_SECRET`: *(Generate a secure random string)*
   - `USE_MOCK_META`: `true` *(or set Meta API keys if using live Meta credentials)*
   - `DATABASE_NAME`: `postpulse_db`
   - *(Optional)* `MONGODB_URL`: *(Your MongoDB Atlas URL, or leave blank to use fast built-in in-memory fallback)*
   - *(Optional)* `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
6. Click **Deploy**. Copy your deployment URL (e.g. `https://postpulse-backend.onrender.com`).

---

### Option B: Railway
1. Log into [Railway.app](https://railway.app) and create a **New Project** from GitHub.
2. Select the repository and specify root path as `backend`.
3. Set Environment Variables (`JWT_SECRET`, `USE_MOCK_META=true`, etc.).
4. Railway will automatically detect `Procfile` and deploy your app. Copy your public domain URL.

---

## 🎨 Step 2: Deploy Frontend (Vercel)

1. Log into [Vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. In the project setup panel:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
4. Expand **Environment Variables** and add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://postpulse-backend.onrender.com` *(Replace with your live backend URL from Step 1)*
5. Click **Deploy**.

---

## ✅ Step 3: Verification

1. Open your Vercel deployment URL (e.g., `https://postpulse.vercel.app`).
2. Log in with the evaluator demo credentials:
   - **Email**: `developer@postpulse.ai`
   - **Password**: `demo1234`
3. Test creating a post, AI content generation, and viewing the interactive calendar!
