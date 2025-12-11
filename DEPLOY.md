# 🚀 Deployment Guide: A.V.E.A on Firebase

This project is configured for a **Serverless Architecture**:
- **Frontend**: Firebase Hosting (Static edge caching)
- **Backend**: Cloud Run (Auto-scaling Python container)

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

**Backend:**
```bash
cd backend
gcloud run deploy avea-backend --source . --region us-central1 --allow-unauthenticated --set-env-vars GOOGLE_API_KEY=your_key
```

**Frontend:**
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## 🛠️ Configuration Notes

- **API Routing**: `firebase.json` automatically rewrites any request to `/api/**` to the Cloud Run service `avea-backend`.
- **Storage**: In Cloud Run, files are saved to `/tmp`. They are ephemeral (deleted when container stops). For permanent storage, enable Google Cloud Storage in `storage.py`.
