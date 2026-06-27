import os
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from backend.database.db import init_db
from backend.services.banking_service import load_caches_from_db
from backend.routes.auth_routes import auth_bp
from backend.routes.banking_routes import banking_bp
from backend.routes.admin_routes import admin_bp

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR      = Path(__file__).resolve().parent.parent   # project root
FRONTEND_DIR  = BASE_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"                    # Vite build output

# ─── Runtime Configuration ────────────────────────────────────────────────────
HOST = os.environ.get("PAYPULSE_HOST", "127.0.0.1")
PORT = int(os.environ.get("PAYPULSE_PORT", "5000"))

# ─── Flask Application ────────────────────────────────────────────────────────
# We disable Flask's built-in static file serving (static_folder=None) because
# when static_url_path="" Flask registers its own broad URL rule that intercepts
# requests before our /<path:path> catch-all can check for the "api/" prefix.
# This caused unknown /api/* routes to return an HTML 404 page instead of JSON.
# All static file serving is now done explicitly in serve_frontend() below.
app = Flask(__name__, static_folder=None)

# ─── Blueprints ───────────────────────────────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(banking_bp)
app.register_blueprint(admin_bp)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"ok": True, "service": "paypulse-flask-dsa", "port": PORT})


# ─── API 404 Safety Net ───────────────────────────────────────────────────────
# Explicit catch-all for /api/* paths that were NOT matched by any blueprint.
# Without this, they would fall through to serve_frontend() and potentially
# return an HTML page, causing "Unexpected token '<'" in the browser.
@app.route("/api/", defaults={"path": ""})
@app.route("/api/<path:path>")
def api_not_found(path):
    return jsonify({"error": f"API route '/api/{path}' not found."}), 404


# ─── SPA Catch-All ────────────────────────────────────────────────────────────
# Serves the built React app for every non-API route so client-side routing
# (e.g. navigating to /dashboard directly) works correctly.
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # Serve a real static file if it exists in dist/ (JS, CSS, images, fonts)
    if path:
        target = FRONTEND_DIST / path
        if target.exists() and target.is_file():
            return send_from_directory(FRONTEND_DIST, path)

    # Fall back to index.html for all SPA routes
    index = FRONTEND_DIST / "index.html"
    if index.exists():
        return send_from_directory(FRONTEND_DIST, "index.html")

    return jsonify({
        "error": "Frontend not built. Run: cd frontend && npm run build"
    }), 503


# ─── Startup Initialisation ───────────────────────────────────────────────────
def _bootstrap():
    init_db()
    load_caches_from_db()
    print(f"[PayPulse] Database initialised. Serving frontend from: {FRONTEND_DIST}")


_bootstrap()


if __name__ == "__main__":
    print(f"[PayPulse] Starting server -> http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=False)
