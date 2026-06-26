@echo off
title PayPulse Banking – Startup Runner
cd /d "%~dp0"

echo.
echo  ██████╗  █████╗ ██╗   ██╗██████╗ ██╗   ██╗██╗     ███████╗███████╗
echo  ██╔══██╗██╔══██╗╚██╗ ██╔╝██╔══██╗██║   ██║██║     ██╔════╝██╔════╝
echo  ██████╔╝███████║ ╚████╔╝ ██████╔╝██║   ██║██║     ███████╗█████╗
echo  ██╔═══╝ ██╔══██║  ╚██╔╝  ██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝
echo  ██║     ██║  ██║   ██║   ██║     ╚██████╔╝███████╗███████║███████╗
echo  ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝
echo.
echo              Digital Banking Platform – by PayPulse Team
echo  ════════════════════════════════════════════════════════════════════
echo.

:: ── Step 1: Detect Python ──────────────────────────────────────────────────
where py >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=py
) else (
    set PYTHON_CMD=python
)

%PYTHON_CMD% --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo         Download Python from https://www.python.org/downloads/
    pause & exit /b 1
)
echo [1/5] Python detected OK.

:: ── Step 2: Python virtual environment ────────────────────────────────────
if exist .venv\Scripts\python.exe (
    .venv\Scripts\python.exe --version >nul 2>&1
    if %errorlevel% equ 0 goto :VENV_OK
)

echo [2/5] Creating Python virtual environment (.venv)...
if exist .venv rmdir /s /q .venv >nul 2>&1
%PYTHON_CMD% -m venv .venv
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create virtual environment.
    pause & exit /b 1
)
goto :INSTALL_DEPS

:VENV_OK
echo [2/5] Virtual environment detected OK.
goto :INSTALL_DEPS

:INSTALL_DEPS
:: ── Step 3: Python dependencies ───────────────────────────────────────────
echo [3/5] Installing / verifying backend Python dependencies...
.venv\Scripts\python.exe -m pip install --upgrade pip --quiet
.venv\Scripts\pip.exe install -r backend\requirements.txt --quiet
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python packages.
    pause & exit /b 1
)
echo       Backend dependencies OK.

:: ── Step 4: Node.js check & npm install ──────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo         Download Node.js from https://nodejs.org/
    pause & exit /b 1
)
echo [4/5] Node.js detected OK.

if not exist frontend\node_modules (
    echo       Installing frontend npm packages. This may take a moment...
    cd frontend && call npm install --silent && cd ..
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause & exit /b 1
    )
)

:: ── Step 5: Build React frontend ─────────────────────────────────────────
echo [5/5] Compiling React frontend for production...
cd frontend && call npm run build && cd ..
if %errorlevel% neq 0 (
    echo [ERROR] React build failed. Fix the error above and retry.
    pause & exit /b 1
)
echo       Frontend compiled to frontend\dist\

:: ── Launch ────────────────────────────────────────────────────────────────
echo.
echo  ════════════════════════════════════════════════════════════════════
echo   [OK]  Setup complete!
echo   [>>]  Launching PayPulse Banking at  http://localhost:5000
echo  ════════════════════════════════════════════════════════════════════
echo.

start "PayPulse Backend" cmd /k ".venv\Scripts\python.exe -m backend.main"
timeout /t 2 /nobreak >nul
start "" "http://localhost:5000"

echo   Server is running. Close the "PayPulse Backend" window to stop.
echo.
pause
