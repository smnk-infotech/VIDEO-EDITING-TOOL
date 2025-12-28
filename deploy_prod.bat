@echo off
echo ========================================================
echo   PREMA.AI - PRODUCTION DEPLOYMENT SEQUENCE
echo ========================================================
echo.

echo [1/4] Checking Google Cloud Login...
call gcloud auth print-access-token >nul 2>&1
if %errorlevel% neq 0 (
    echo You are not logged in. Opening login page...
    call gcloud auth login
) else (
    echo Verified: Logged in.
)
echo.

set /p PROJECT_ID="Enter your Google Cloud Project ID (e.g., prema-prod-123): "
call gcloud config set project %PROJECT_ID%
echo.

echo [2/4] Deploying BACKEND (Python/FastAPI)...
echo This may take 2-3 minutes.
cd backend
call gcloud run deploy prema-backend ^
  --source . ^
  --port 8000 ^
  --allow-unauthenticated ^
  --region us-central1
if %errorlevel% neq 0 (
    echo Backend deployment failed. Exiting.
    pause
    exit /b
)
cd ..

echo.
echo Capture the backend URL above.
set /p BACKEND_URL="Paste the Backend URL here (e.g., https://...run.app): "
echo.

echo [3/4] Deploying FRONTEND (Next.js)...
cd frontend
call gcloud run deploy prema-frontend ^
  --source . ^
  --port 3000 ^
  --allow-unauthenticated ^
  --region us-central1 ^
  --set-env-vars BACKEND_URL=%BACKEND_URL%
if %errorlevel% neq 0 (
    echo Frontend deployment failed. Exiting.
    pause
    exit /b
)
cd ..

echo.
echo [4/4] Linking Services (CORS)...
set /p FRONTEND_URL="Paste the final Frontend URL here (from above): "
call gcloud run services update prema-backend ^
  --region us-central1 ^
  --set-env-vars ALLOWED_ORIGINS=%FRONTEND_URL%

echo.
echo ========================================================
echo   DEPLOYMENT COMPLETE! 🚀
echo   Access your app at: %FRONTEND_URL%
echo ========================================================
pause
