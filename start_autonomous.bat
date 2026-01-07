
@echo off
echo ==========================================
echo       LAUNCHING ANTIGRAVITY V2
echo ==========================================

echo [1/3] Killing old processes...
taskkill /F /IM python.exe /T 2>NUL
taskkill /F /IM node.exe /T 2>NUL
taskkill /F /IM uvicorn.exe /T 2>NUL

echo [2/3] Starting Backend (Port 8080)...
start "AVEA Backend" cmd /k "call .venv\Scripts\activate && cd backend && python -m uvicorn app.main:app --reload --port 8080"

echo [3/3] Starting Frontend (Port 3000)...
start "AVEA Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo SYSTEM ONLINE.
echo Access: http://localhost:3000
echo ==========================================
pause
