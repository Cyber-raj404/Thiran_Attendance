@echo off
TITLE Hackathon Organizer Launcher

echo ===================================================
echo   Starting Hackathon Organizer App...
echo ===================================================

:: 1. Start Backend in a new minimized window
echo Starting Backend Server...
start "Hackathon Backend" /MIN cmd /k "cd backend && npm start"

:: 2. Wait a few seconds for backend to initialize
timeout /t 5 /nobreak >nul

:: 3. Start Frontend in a new minimized window
echo Starting Frontend...
start "Hackathon Frontend" /MIN cmd /k "cd frontend && npm run dev"

:: 4. Open Browser
echo Opening App in Browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo ===================================================
echo   App is running! 
echo   Minimizing this window...
echo ===================================================
timeout /t 5 /nobreak >nul
exit
