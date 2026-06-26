import os
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from backend.database.db import init_db
from backend.services.banking_service import load_caches_from_db
from backend.routes.auth_routes import auth_bp
from backend.routes.banking_routes import banking_bp
from backend.routes.admin_routes import admin_bp

# Base Directories
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"
HOST = os.environ.get("PAYPULSE_HOST", "127.0.0.1")
PORT = int(os.environ.get("PAYPULSE_PORT", "5000"))

app = Flask(__name__)

# Register MVC Route Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(banking_bp)
app.register_blueprint(admin_bp)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"ok": True, "service": "paypulse-flask-dsa"})

# ----------------------------------------------------
# STATIC FRONTEND SERVING
# ----------------------------------------------------

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    
    # Check if the requested file exists in dist
    file_path = FRONTEND_DIST / path
    if file_path.exists() and file_path.is_file():
        return send_from_directory(FRONTEND_DIST, path)
        
    return send_from_directory(FRONTEND_DIST, "index.html")

if __name__ == "__main__":
    # 1. Initialize SQLite Database Tables
    init_db()
    # 2. Populate In-Memory DSA Models (Stack, Queue, Dictionary)
    load_caches_from_db()
    
    print(f"PayPulse DSA Backend running at http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=False)
