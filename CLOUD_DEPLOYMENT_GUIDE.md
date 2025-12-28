# Cloud Deployment Guide - Firebase + Cloud Run

**Project:** prema.ai (smnk-infotech/VIDEO-EDITING-TOOL)  
**Platforms:** Firebase Hosting (Frontend) + Google Cloud Run (Backend)  
**Region:** us-central1

---

## Prerequisites

### 1. Install Required Tools

```powershell
# Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install-gcloud-cli
# Or use choco: choco install gcloud-sdk

# Firebase CLI
npm install -g firebase-tools

# Verify installations
gcloud --version
firebase --version
```

### 2. Set Up Google Cloud Project

```powershell
# Create a new project or use existing
gcloud projects create video-editing-tool --name="Video Editing Tool"
gcloud config set project video-editing-tool

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  firebasehosting.googleapis.com \
  firestore.googleapis.com
```

### 3. Configure Firebase

```powershell
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init
# Select: Hosting, Firestore

# Link Firebase to your project
firebase projects:addalias video-editing-tool
```

---

## Deployment Steps

### Step 1: Update Configuration Files

**Update firebase.json with your Cloud Run service ID:**

```json
{
    "hosting": {
        "public": "frontend/out",
        "ignore": [
            "firebase.json",
            "**/.*",
            "**/node_modules/**"
        ],
        "rewrites": [
            {
                "source": "/api/**",
                "run": {
                    "serviceId": "video-editing-tool-backend",
                    "region": "us-central1"
                }
            },
            {
                "source": "**",
                "destination": "/index.html"
            }
        ]
    }
}
```

**Update backend/.env for production:**

```dotenv
# Google Gemini API Key (REQUIRED - keep secure)
GOOGLE_API_KEY=AIzaSyDGnmyWAT64btB3k_GPPxWEXMCoGzvOBeY

# Production CORS Configuration
ALLOWED_ORIGINS=https://video-editing-tool.firebaseapp.com,https://video-editing-tool.web.app

# App Settings
ENVIRONMENT=production
DEBUG=False
```

---

### Step 2: Build Frontend

```powershell
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Verify output directory
ls out/
# Should show: _next/, app/, index.html, etc.

cd ..
```

---

### Step 3: Deploy Backend to Cloud Run

```powershell
cd backend

# Build Docker image and push to Container Registry
gcloud builds submit \
  --tag gcr.io/video-editing-tool/video-editing-tool-backend \
  --timeout=1200s

# Deploy to Cloud Run
gcloud run deploy video-editing-tool-backend \
  --image gcr.io/video-editing-tool/video-editing-tool-backend \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --set-env-vars "GOOGLE_API_KEY=AIzaSyDGnmyWAT64btB3k_GPPxWEXMCoGzvOBeY" \
  --allow-unauthenticated \
  --no-gen2

# Note: The service will be output, save the URL
# Expected output: https://video-editing-tool-backend-xxx.run.app

cd ..
```

---

### Step 4: Deploy Frontend to Firebase Hosting

```powershell
# Deploy hosting only
firebase deploy --only hosting

# This deploys the frontend/out directory to Firebase Hosting
# URL: https://video-editing-tool.firebaseapp.com
```

---

### Step 5: Complete Deployment

```powershell
# Deploy everything (hosting + Cloud Run rewrite configuration)
firebase deploy

# This ensures the API rewrites are properly configured
```

---

## Verification

### Test Backend

```powershell
# Check health endpoint
curl https://video-editing-tool-backend-xxx.run.app/health

# Expected response:
# {"status": "ok"}

# Test API endpoint
curl -X POST https://video-editing-tool-backend-xxx.run.app/api/projects/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev_token" \
  -d '{
    "name": "Test Project",
    "video_source": "test.mp4"
  }'
```

### Test Frontend

```powershell
# Open in browser
https://video-editing-tool.firebaseapp.com

# Expected:
# 1. Landing page loads
# 2. Login button visible
# 3. Can click through to dashboard
# 4. API calls work to backend
```

### Complete Workflow Test

1. **Login:** Use Google Sign-In
2. **Create Project:** Upload a test video
3. **Analyze:** Send video for Gemini analysis
4. **Check Results:** Verify AI analysis returned
5. **Render:** Attempt to render with effects

---

## Environment Variables for Cloud Run

Cloud Run automatically reads from `.env` file during deployment. Key variables:

| Variable | Example | Required |
|----------|---------|----------|
| GOOGLE_API_KEY | AIzaSy... | Yes |
| ALLOWED_ORIGINS | https://video-editing-tool.firebaseapp.com | Yes |
| ENVIRONMENT | production | Yes |
| DEBUG | False | Yes |

---

## Monitoring & Logs

### View Backend Logs

```powershell
# Real-time logs
gcloud run logs read video-editing-tool-backend --limit 100

# Filter by time
gcloud run logs read video-editing-tool-backend \
  --limit 100 \
  --min-log-level ERROR
```

### View Frontend Logs

```powershell
# Firebase hosting logs
firebase functions:log

# Hosting logs in console
firebase hosting:logs
```

### Cloud Monitoring

```powershell
# View metrics in GCP Console
# https://console.cloud.google.com/run/detail/us-central1/video-editing-tool-backend

# Set up alerts for:
# - Request rate > 1000/min
# - Error rate > 5%
# - Response time > 5s
```

---

## Troubleshooting

### Backend Won't Deploy

**Check Docker build:**
```powershell
cd backend
docker build -t test-build .
docker run -it test-build /bin/bash
```

**Check Cloud Build logs:**
```powershell
gcloud builds log BUILD_ID --stream
```

### API Returns 502 Bad Gateway

**Causes:**
1. Backend service not running
2. GOOGLE_API_KEY invalid
3. Service account permissions

**Fix:**
```powershell
# Restart service
gcloud run services update-traffic video-editing-tool-backend --to-revisions LATEST=100

# Check service status
gcloud run services describe video-editing-tool-backend
```

### Frontend Can't Connect to API

**Check rewrites in firebase.json:**
```powershell
firebase serve  # Test locally first
```

**Verify Cloud Run URL:**
```powershell
# Get service URL
gcloud run services describe video-editing-tool-backend --format='value(status.url)'
```

**Update ALLOWED_ORIGINS:**
```powershell
# If frontend URL is different, update backend/.env
ALLOWED_ORIGINS=https://your-firebase-hosting-url.firebaseapp.com
```

---

## Cost Optimization

### Reduce Cloud Run Costs

```powershell
# Reduce memory/CPU for lower traffic
gcloud run deploy video-editing-tool-backend \
  --memory 1Gi \
  --cpu 1

# Set concurrency limit
gcloud run deploy video-editing-tool-backend \
  --concurrency 10

# Enable auto-scaling
gcloud run deploy video-editing-tool-backend \
  --max-instances 10 \
  --min-instances 1
```

### Reduce Firebase Hosting Costs

- Enable caching headers for static assets
- Use Firebase Storage for large files
- Enable CDN caching

---

## Rollback Procedures

### Rollback Backend to Previous Version

```powershell
# List revisions
gcloud run revisions list --service video-editing-tool-backend

# Deploy previous revision
gcloud run services update-traffic video-editing-tool-backend \
  --to-revisions PREVIOUS=100
```

### Rollback Frontend

```powershell
# List releases
firebase hosting:releases:list

# Rollback to previous release
firebase hosting:releases:rollback
```

---

## Post-Deployment Tasks

1. **Update DNS (if using custom domain)**
   ```powershell
   firebase hosting:domain:create
   ```

2. **Set up monitoring alerts**
   ```powershell
   gcloud alpha monitoring policies create \
     --notification-channels=CHANNEL_ID \
     --display-name="Cloud Run Errors"
   ```

3. **Enable Cloud Logging**
   ```powershell
   gcloud logging write video-editing-tool "Deployment complete" \
     --severity=INFO
   ```

4. **Configure backup strategy**
   - Enable Firestore backups
   - Set up Cloud Storage backups
   - Configure database snapshots

---

## Production Checklist

- [ ] Google Cloud project created
- [ ] Firebase project initialized
- [ ] APIs enabled (Cloud Build, Cloud Run, Firestore)
- [ ] GOOGLE_API_KEY set securely in Cloud Run
- [ ] Frontend built (`npm run build`)
- [ ] Backend Docker image built
- [ ] Backend deployed to Cloud Run
- [ ] Frontend deployed to Firebase Hosting
- [ ] API rewrites configured in firebase.json
- [ ] Health endpoint responding
- [ ] Login functionality working
- [ ] API calls succeeding
- [ ] Logs being collected
- [ ] Monitoring alerts configured
- [ ] Custom domain configured (if needed)

---

## Support & Documentation

- **Cloud Run Docs:** https://cloud.google.com/run/docs
- **Firebase Hosting Docs:** https://firebase.google.com/docs/hosting
- **GCP Console:** https://console.cloud.google.com
- **Firebase Console:** https://console.firebase.google.com

---

**Deployment Complete!** Your application is now live in production.
