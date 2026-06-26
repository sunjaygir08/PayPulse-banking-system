#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  PayPulse Banking Platform – Startup Runner (Linux / macOS)
# ─────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")"

echo ""
echo "  ██████╗  █████╗ ██╗   ██╗██████╗ ██╗   ██╗██╗     ███████╗███████╗"
echo "  ██╔══██╗██╔══██╗╚██╗ ██╔╝██╔══██╗██║   ██║██║     ██╔════╝██╔════╝"
echo "  ██████╔╝███████║ ╚████╔╝ ██████╔╝██║   ██║██║     ███████╗█████╗  "
echo "  ██╔═══╝ ██╔══██║  ╚██╔╝  ██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝  "
echo "  ██║     ██║  ██║   ██║   ██║     ╚██████╔╝███████╗███████║███████╗"
echo "  ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝"
echo ""
echo "             Digital Banking Platform – by PayPulse Team"
echo "  ════════════════════════════════════════════════════════════════════"
echo ""

# ── Step 1: Python ────────────────────────────────────────────────────────────
PYTHON_CMD="python3"
if ! command -v python3 &>/dev/null; then
    PYTHON_CMD="python"
fi
$PYTHON_CMD --version &>/dev/null || {
    echo "[ERROR] Python 3 is not installed. Install from https://www.python.org/"
    exit 1
}
echo "[1/5] Python detected OK."

# ── Step 2: Virtual environment ───────────────────────────────────────────────
if [ ! -f ".venv/bin/python" ]; then
    echo "[2/5] Creating virtual environment (.venv)..."
    $PYTHON_CMD -m venv .venv
else
    echo "[2/5] Virtual environment detected OK."
fi
source .venv/bin/activate

# ── Step 3: Backend dependencies ──────────────────────────────────────────────
echo "[3/5] Installing / verifying backend Python dependencies..."
pip install --upgrade pip --quiet
pip install -r backend/requirements.txt --quiet
echo "      Backend dependencies OK."

# ── Step 4: Node.js & npm install ─────────────────────────────────────────────
command -v node &>/dev/null || {
    echo "[ERROR] Node.js is not installed. Install from https://nodejs.org/"
    exit 1
}
echo "[4/5] Node.js detected OK."

if [ ! -d "frontend/node_modules" ]; then
    echo "      Installing frontend npm packages..."
    cd frontend && npm install --silent && cd ..
fi

# ── Step 5: Build React frontend ─────────────────────────────────────────────
echo "[5/5] Compiling React frontend for production..."
cd frontend && npm run build && cd ..
echo "      Frontend compiled to frontend/dist/"

# ── Launch ────────────────────────────────────────────────────────────────────
echo ""
echo "  ════════════════════════════════════════════════════════════════════"
echo "   [OK]  Setup complete!"
echo "   [>>]  PayPulse Banking is starting at  http://localhost:5000"
echo "  ════════════════════════════════════════════════════════════════════"
echo ""

# Open browser (best-effort, non-blocking)
(sleep 2 && (open "http://localhost:5000" 2>/dev/null || xdg-open "http://localhost:5000" 2>/dev/null || true)) &

# Start Flask (foreground — Ctrl+C to stop)
python -m backend.main
