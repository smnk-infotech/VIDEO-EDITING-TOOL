# Cloud Deployment - Quick Reference

## One-Line Deployment (After Prerequisites)

```powershell
# Full deployment to Firebase + Cloud Run
.\deploy-cloud.ps1

# With custom project ID
.\deploy-cloud.ps1 -ProjectId my-project-id

# Skip frontend or backend
.\deploy-cloud.ps1 -SkipFrontend  # Backend only
.\deploy-cloud.ps1 -SkipBackend   # Frontend only
```

---

## Manual Step-by-Step

### 1. Login to Google Cloud & Firebase

```powershell
gcloud auth login
firebase login
gcloud config set project video-editing-tool
```

### 2. Build Frontend

```powershell
cd frontend
npm install
npm run build
cd ..
```

### 3. Deploy Backend (Cloud Run)

```powershell
cd backend

# Build Docker image
gcloud builds submit --tag gcr.io/video-editing-tool/video-editing-tool-backend

# Deploy to Cloud Run
gcloud run deploy video-editing-tool-backend `
  --image gcr.io/video-editing-tool/video-editing-tool-backend `
  --platform managed `
  --region us-central1 `
  --memory 2Gi `
  --cpu 2 `
  --set-env-vars "GOOGLE_API_KEY=AIzaSyDGnmyWAT64btB3k_GPPxWEXMCoGzvOBeY" `
  --allow-unauthenticated

cd ..
```

### 4. Deploy Frontend (Firebase)

```powershell
firebase deploy --only hosting
```

### 5. Complete Deployment

```powershell
firebase deploy
```

---

## Verification Commands

```powershell
# Check backend health
curl https://video-editing-tool-backend-[HASH].run.app/health

# Open frontend
start https://video-editing-tool.firebaseapp.com

# View backend logs
gcloud run logs read video-editing-tool-backend --limit 50

# View frontend logs
firebase hosting:logs
```

---

## Configuration Files

**firebase.json** - Already configured for:
- Frontend hosting from `frontend/out`
- API rewrites to Cloud Run service
- SPA routing fallback

**backend/.env** - Already configured with:
- GOOGLE_API_KEY (required for Gemini API)
- ALLOWED_ORIGINS (set to Firebase domain)
- ENVIRONMENT=production
- DEBUG=False

**backend/Dockerfile** - Ready for Cloud Run:
- Python 3.11 slim base
- FFmpeg + system dependencies
- Automatic requirements.txt installation

---

## Troubleshooting

### Can't login to gcloud

```powershell
# Clear cached credentials
gcloud auth revoke
gcloud auth login
```

### Docker build fails

```powershell
# Check Docker daemon
docker info

# Verify Dockerfile
cd backend
docker build -t test .
```

### Cloud Run deployment fails

```powershell
# View build logs
gcloud builds log BUILD_ID --stream

# Check service status
gcloud run services describe video-editing-tool-backend
```

### Frontend can't connect to backend

```powershell
# Test CORS
curl -H "Origin: https://video-editing-tool.firebaseapp.com" \
  https://video-editing-tool-backend-xxx.run.app/health

# Update ALLOWED_ORIGINS in backend/.env
```

---

## Cost Saving Tips

```powershell
# Reduce resource allocation
gcloud run deploy video-editing-tool-backend \
  --memory 1Gi \
  --cpu 1

# Set min/max instances
gcloud run deploy video-editing-tool-backend \
  --min-instances 0 \
  --max-instances 5
```

---

## Monitoring

```powershell
# Real-time logs with color
gcloud run logs read video-editing-tool-backend --limit 100

# Filter by severity
gcloud run logs read video-editing-tool-backend \
  --limit 50 \
  --min-log-level ERROR

# Follow logs
gcloud alpha run logs read video-editing-tool-backend --follow
```

---

## Rollback

```powershell
# List previous revisions
gcloud run revisions list --service video-editing-tool-backend

# Deploy specific revision
gcloud run services update-traffic video-editing-tool-backend \
  --to-revisions REVISION_ID=100
```

---

## Project URLs

- **Frontend:** https://video-editing-tool.firebaseapp.com
- **Backend:** https://video-editing-tool-backend-xxx.run.app
- **GCP Console:** https://console.cloud.google.com
- **Firebase Console:** https://console.firebase.google.com

---

## Summary

✅ Frontend: Hosted on Firebase (CDN distributed)  
✅ Backend: Running on Cloud Run (auto-scaling, serverless)  
✅ Database: Firestore (auto-scaling NoSQL)  
✅ Files: Cloud Storage (video uploads)  
✅ APIs: Rewritten from `/api/**` to Cloud Run  
✅ Monitoring: Cloud Logging enabled  

**Result:** Production-ready app deployed in the cloud!
