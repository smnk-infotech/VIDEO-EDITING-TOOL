@echo off
echo ==========================================
echo       Starting A.V.E.A Locally
echo ==========================================
echo.
echo [1/2] Launching Backend (Port 8080)...
start "AVEA Backend" cmd /k "call .venv\Scripts\activate && cd backend && uvicorn app.main:app --reload --port 8080"

echo [2/2] Launching Frontend (Port 3000)...
start "AVEA Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo       System Running!
echo ==========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8080/docs
echo.
pause
