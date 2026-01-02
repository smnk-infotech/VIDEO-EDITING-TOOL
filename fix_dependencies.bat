@echo off
echo ==========================================
echo       Fixing AVEA Dependencies
echo ==========================================
echo.
echo [1/2] Activating Virtual Environment...
call .venv\Scripts\activate

echo.
echo [2/2] Installing Missing Packages...
pip install pydantic-settings python-dotenv google-cloud-firestore gTTS

echo.
echo ==========================================
echo       Repair Complete!
echo ==========================================
pause
