# 🛡️ A.V.E.A Maintenance Protocol

> **System Status**: 🟢 LIVE PRODUCTION
> **Live URL**: https://prema-video-editor-live.web.app
> **Source of Truth**: If the live URL works, the system is healthy. Ignore CLI errors.

## 🧱 Immutable Architecture

1.  **Frontend**: hosted on **Firebase Hosting**.
2.  **Backend**: hosted on **Cloud Run** (`prema-backend`).
3.  **Routing**: 
    - User request -> Firebase CDN -> `/api/*` -> Rewrite -> Cloud Run.
    - User request -> Firebase CDN -> `/*` -> Static File (Next.js Export).

## 🔐 Security Constitution

1.  **NO SECRETS IN CODE**: API keys (Gemini, Firebase) must **never** be committed to GitHub or bundled in the frontend.
2.  **Cloud Run Isolation**: All sensitive keys must be injected as **Environment Variables** in the Cloud Run service configuration only.
3.  **Public Access**: The Frontend is public (`--allow-unauthenticated`). The Backend is public but intended to be accessed via the Firebase Proxy.

## 🚫 Forbidden Actions

1.  **DO NOT Re-initialize Firebase**: The `firebase.json` and `.firebaserc` are locked. Do not run `firebase init`.
2.  **DO NOT Delete Hosting Sites**: The site `prema-video-editor-live` is the production target. Never delete it.
3.  **DO NOT Change Build Targets**: We use `target: apply` logic. Do not revert to `site: "..."` in `firebase.json`.

## 🛠 Deployment Procedure

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Deploy to Production
```bash
# FROM ROOT directory
firebase deploy --only hosting
```
*Note: If CLI reports "Entity not found" but the site updates, it is a false positive.*

## 🩺 Health Check
- **Endpoint**: `/api/health`
- **Response**: `{"status": "ok"}` (or similar 200 OK)
