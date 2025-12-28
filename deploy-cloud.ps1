#!/usr/bin/env powershell
<#
.SYNOPSIS
Cloud Deployment Script for prema.ai
Deploys frontend to Firebase Hosting and backend to Cloud Run

.PARAMETER ProjectId
GCP Project ID (default: video-editing-tool)

.PARAMETER Region
GCP Region (default: us-central1)

.PARAMETER SkipFrontend
Skip frontend deployment

.PARAMETER SkipBackend
Skip backend deployment
#>

param(
    [string]$ProjectId = "video-editing-tool",
    [string]$Region = "us-central1",
    [switch]$SkipFrontend,
    [switch]$SkipBackend,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message, [string]$Color = "Green")
    Write-Host "`n>>> $Message" -ForegroundColor $Color
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "`n!!! ERROR: $Message" -ForegroundColor Red
    exit 1
}

# Check prerequisites
Write-Status "Checking prerequisites..."

try {
    gcloud --version > $null
    firebase --version > $null
    docker --version > $null
} catch {
    Write-Error-Custom "Missing required tools. Install gcloud-sdk, firebase-tools, and docker."
}

Write-Status "Prerequisites OK"

# Set GCP project
Write-Status "Setting GCP project to $ProjectId..."
gcloud config set project $ProjectId

# Build Frontend
if (-not $SkipFrontend -and -not $SkipBuild) {
    Write-Status "Building frontend..." "Cyan"
    Push-Location frontend
    npm install
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Frontend build failed"
    }
    Pop-Location
    Write-Status "Frontend build complete"
}

# Deploy Backend
if (-not $SkipBackend) {
    Write-Status "Deploying backend to Cloud Run..." "Cyan"
    Push-Location backend
    
    Write-Status "Building Docker image..." "Yellow"
    $imageName = "gcr.io/$ProjectId/video-editing-tool-backend"
    gcloud builds submit --tag $imageName --timeout=1200s
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Docker build failed"
    }
    
    Write-Status "Deploying to Cloud Run..." "Yellow"
    gcloud run deploy video-editing-tool-backend `
        --image $imageName `
        --platform managed `
        --region $Region `
        --memory 2Gi `
        --cpu 2 `
        --timeout 3600 `
        --set-env-vars "GOOGLE_API_KEY=AIzaSyDGnmyWAT64btB3k_GPPxWEXMCoGzvOBeY" `
        --allow-unauthenticated `
        --no-gen2
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Cloud Run deployment failed"
    }
    
    Pop-Location
    Write-Status "Backend deployed to Cloud Run"
}

# Deploy Frontend
if (-not $SkipFrontend) {
    Write-Status "Deploying frontend to Firebase Hosting..." "Cyan"
    firebase deploy --only hosting
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Firebase hosting deployment failed"
    }
    
    Write-Status "Frontend deployed to Firebase Hosting"
}

# Complete deployment
if (-not $SkipFrontend -and -not $SkipBackend) {
    Write-Status "Completing deployment..." "Cyan"
    firebase deploy
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Final deployment step failed"
    }
}

# Get URLs
Write-Status "DEPLOYMENT COMPLETE!" "Green"

Write-Host "`nService URLs:" -ForegroundColor Green

if (-not $SkipBackend) {
    $backendUrl = gcloud run services describe video-editing-tool-backend `
        --region $Region `
        --format='value(status.url)' 2>$null
    Write-Host "  Backend: $backendUrl" -ForegroundColor Cyan
}

if (-not $SkipFrontend) {
    Write-Host "  Frontend: https://$ProjectId.firebaseapp.com" -ForegroundColor Cyan
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Test the health endpoint:"
Write-Host "     curl https://video-editing-tool-backend-xxx.run.app/health"
Write-Host "  2. Open frontend in browser:"
Write-Host "     https://$ProjectId.firebaseapp.com"
Write-Host "  3. Test login and API connectivity"
Write-Host "  4. View logs:"
Write-Host "     firebase hosting:logs"
Write-Host "     gcloud run logs read video-editing-tool-backend"
