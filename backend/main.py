import os
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from backend.database.db import init_db
from backend.services.banking_service import load_caches_from_db
from backend.routes.auth_routes import auth_bp
from backend.routes.banking_routes import banking_bp
from backend.routes.admin_routes import admin_bp

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR     = Path(__file__).resolve().parent.parent   # project root
FRONTEND_DIR = BASE_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"                   # Vite build output

# ─── Runtime Configuration ────────────────────────────────────────────────────
HOST = os.environ.get("PAYPULSE_HOST", "127.0.0.1")
PORT = int(os.environ.get("PAYPULSE_PORT", "5000"))

# ─── Flask Application ────────────────────────────────────────────────────────
app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIST),
    static_url_path="",       # serve dist/ contents directly from '/'
)

# ─── Blueprints ───────────────────────────────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(banking_bp)
app.register_blueprint(admin_bp)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"ok": True, "service": "paypulse-flask-dsa", "port": PORT})


# ─── SPA Catch-All (serves index.html for all non-API routes) ─────────────────
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # Never intercept API calls — they are handled by blueprints above.
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404

    # Serve a real static file if it exists in dist/ (JS, CSS, images, etc.)
    target = FRONTEND_DIST / path
    if target.exists() and target.is_file():
        return send_from_directory(FRONTEND_DIST, path)

    # Fall back to index.html so React Router can handle client-side navigation.
    index = FRONTEND_DIST / "index.html"
    if index.exists():
        return send_from_directory(FRONTEND_DIST, "index.html")

    return jsonify({"error": "Frontend not built. Run: cd frontend && npm run build"}), 503


# ─── Startup Initialisation ───────────────────────────────────────────────────
# Called both when executed directly (`python -m backend.main`) and when
# imported by a WSGI server (gunicorn, waitress).  Guard avoids double-init
# when Flask's reloader spawns a child process.
def _bootstrap():
    init_db()
    load_caches_from_db()
    print(f"[PayPulse] Database initialised. Serving frontend from: {FRONTEND_DIST}")


_bootstrap()


if __name__ == "__main__":
    print(f"[PayPulse] Starting server → http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=False)
