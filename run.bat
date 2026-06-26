@echo off
title "PayPulse Banking Setup & Runner"
cd /d "%~dp0"

echo ====================================================
echo             PAYPULSE BANKING RUNNER
echo ====================================================
echo.

:: Detect Python command
where py >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=py
) else (
    set PYTHON_CMD=python
)

:: Verify python is runnable
%PYTHON_CMD% --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    pause
    exit /b 1
)

:: Check if virtual environment exists and is working
if not exist .venv\Scripts\python.exe goto :CREATE_VENV
.venv\Scripts\python.exe --version >nul 2>&1
if %errorlevel% neq 0 goto :CREATE_VENV
goto :VENV_OK

:CREATE_VENV
echo [INFO] Creating Python virtual environment (.venv)...
if exist .venv rmdir /s /q .venv >nul 2>&1
%PYTHON_CMD% -m venv .venv
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b 1
)

:VENV_OK
echo [INFO] Installing/updating backend Python dependencies...
.venv\Scripts\python.exe -m pip install --upgrade pip >nul 2>&1
.venv\Scripts\pip.exe install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b 1
)

:: Check for Node and NPM
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Node.js is required to install frontend dependencies and build the React app.
    pause
    exit /b 1
)

:: Install frontend dependencies
if not exist frontend\node_modules goto :INSTALL_NODE_MODULES
goto :BUILD_FRONTEND

:INSTALL_NODE_MODULES
echo [INFO] Installing frontend npm packages. This may take a moment...
cd frontend && call npm install && cd ..

:BUILD_FRONTEND
echo [INFO] Compiling React frontend...
cd frontend && call npm run build && cd ..
if %errorlevel% neq 0 (
    echo [ERROR] React compilation failed.
    pause
    exit /b 1
)

echo.
echo [OK] Environment is set up successfully!
echo [INFO] Launching PayPulse FastAPI Server at http://localhost:5000...
echo.

:: Start server
start "PayPulse Banking Server" cmd /k ".venv\Scripts\python.exe -m backend.main"
timeout /t 3 /nobreak >nul
start "" "http://localhost:5000"

echo [OK] PayPulse Banking is up and running.
echo.
pause
