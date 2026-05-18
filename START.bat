@echo off
title TaskFlow - Starting Server...
color 0A

echo.
echo  ==========================================
echo    TaskFlow - Professional Task Manager
echo  ==========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  [ERROR] Node.js is NOT installed on this computer!
    echo.
    echo  Please download and install Node.js from:
    echo  https://nodejs.org  (Download the LTS version)
    echo.
    pause
    exit
)

echo  [OK] Node.js found.
echo.

:: Go to backend folder
cd /d "%~dp0backend"

:: Install dependencies if node_modules doesn't exist
IF NOT EXIST "node_modules\" (
    echo  [INFO] Installing dependencies for the first time...
    echo  (This may take 1-2 minutes, please wait...)
    echo.
    npm install
    echo.
    echo  [OK] Dependencies installed successfully!
    echo.
)

echo  [OK] All dependencies ready.
echo.
echo  ==========================================
echo    Server starting on http://localhost:3000
echo    Press Ctrl+C to stop the server
echo  ==========================================
echo.

:: Open browser after 2 seconds
start "" timeout /t 2 >nul
start "" "http://localhost:3000"

:: Start the server
node server.js

pause
