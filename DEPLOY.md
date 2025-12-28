# 🚀 Deployment Guide: A.V.E.A on Firebase

- **Frontend**: Firebase Hosting (proxy to backend) & Cloud Run (SSR)
- **Backend**: Cloud Run (Python FastAPI, Port 8080)
- **Security**: All API keys injected via Cloud Run Environment Variables (No client-side keys).

## 🔒 Architecture & Security Audit
- **Routing**: Users -> Firebase Hosting -> `/api/**` -> Cloud Run Backend.
- **Secrets**: `GOOGLE_API_KEY`, `FIREBASE_CREDENTIALS` are strictly server-side.
- **Port**: Backend listens on `$PORT` (8080) explicitly.

---

## 🔑 1. Google Cloud Setup

1.  **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/) and create a new project called `avea-video-editor`.
2.  **Upgrade Billing**: Go to GCP Console -> Billing and link a Billing Account (Required for Cloud Run).
3.  **Enable APIs**:
    - Cloud Run Admin API
    - Artifact Registry API
    - Cloud Build API
    - IAM Service Account Credentials API

---

## 🤖 2. GitHub Secrets

Go to your GitHub Repo -> **Settings** -> **Secrets and variables** -> **Actions** and add:

| Secret Name | Value |
| :--- | :--- |
| `GOOGLE_API_KEY` | Your Gemini API Key. |
| `GCP_SA_KEY` | JSON Key of a Service Account with "Cloud Run Admin" and "Artifact Registry Writer" roles. |
| `FIREBASE_SERVICE_ACCOUNT_AVEA_VIDEO_EDITOR` | JSON Key (See below). |

### Getting the Firebase Service Account Key:
1.  Run `firebase init hosting:github` locally (optional) OR:
2.  Go to GCP Console -> IAM -> Service Accounts.
3.  Create key for `firebase-adminsdk` account -> Download JSON.
4.  Paste content into `FIREBASE_SERVICE_ACCOUNT_AVEA_VIDEO_EDITOR`.

---

## ☁️ 3. Deploy

### Option A: Automatic (GitHub)
- Push to `main` branch.
- Watch **Actions** tab.
    - `Deploy Backend` will build Docker container and push to Cloud Run.
    - `Deploy Frontend` will build Next.js and push to Firebase Hosting.

### Option B: Manual (CLI)

### Frontend (Cloud Run)
- **URL**: `https://prema-frontend-574658991310.us-central1.run.app`
- **Status**: Live

### Backend (Cloud Run)
- **URL**: `https://prema-backend-574658991310.us-central1.run.app`
- **Region**: `us-central1`
- **Status**: Live & Operational

### Frontend (Firebase Hosting)
- **URL**: `https://prema-video-editor-live.web.app`
- **Status**: ✅ **Live & Deployed**
```bash
cd backend
gcloud run deploy avea-backend --source . --region us-central1 --allow-unauthenticated --set-env-vars GOOGLE_API_KEY=your_key
```

**Frontend:**
```bash
cd frontend
# Development Mode (Robust)
gcloud run deploy prema-frontend --source . --region us-central1 --allow-unauthenticated --set-env-vars BACKEND_URL=https://prema-backend-574658991310.us-central1.run.app
```

### Option C: Firebase Hosting (Custom Domain)
> **Note:** Requires manual project linking in Firebase Console first and ensuring `firebase login` account has owner/editor access.
```bash
# Verify project visibility first
firebase projects:list 

# Then deploy
firebase deploy --only hosting
```

---

## 🛠️ Configuration Notes

- **API Routing**: `firebase.json` automatically rewrites any request to `/api/**` to the Cloud Run service `avea-backend`.
- **Storage**: In Cloud Run, files are saved to `/tmp`. They are ephemeral (deleted when container stops). For permanent storage, enable Google Cloud Storage in `storage.py`.
