import os
import json
import sqlite3
import hashlib
import random
from datetime import datetime, timezone
from pathlib import Path
from flask import Flask, request, jsonify, make_response, send_from_directory

# Base Directories
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
FRONTEND_DIST = FRONTEND_DIR / "dist"
DB_PATH = Path(os.environ.get("PAYPULSE_DB_PATH", BASE_DIR / "banking.db"))
HOST = os.environ.get("PAYPULSE_HOST", "127.0.0.1")
PORT = int(os.environ.get("PAYPULSE_PORT", "5000"))

app = Flask(__name__)

# ----------------------------------------------------
# DATABASE UTILITIES
# ----------------------------------------------------

def connect_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect_db() as conn:
        # Users Table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                avatar_url TEXT,
                security_pin TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        # Accounts Table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                account_type TEXT NOT NULL, -- checking, savings, credit
                account_number TEXT UNIQUE NOT NULL,
                routing_number TEXT NOT NULL,
                balance REAL NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        # Transactions Table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_account_id INTEGER NOT NULL,
                recipient_account_id INTEGER,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                type TEXT NOT NULL, -- deposit, transfer, bill, charge
                status TEXT NOT NULL,
                note TEXT,
                created_at TEXT NOT NULL,
                title TEXT NOT NULL,
                FOREIGN KEY (sender_account_id) REFERENCES accounts(id)
            )
        """)
        # Bills Table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS bills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                payee TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                due_date TEXT NOT NULL,
                status TEXT NOT NULL, -- pending, paid
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        # Virtual Cards Table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                card_number TEXT UNIQUE NOT NULL,
                card_holder TEXT NOT NULL,
                expiry TEXT NOT NULL,
                cvv TEXT NOT NULL,
                type TEXT NOT NULL, -- visa, mastercard
                status TEXT NOT NULL, -- active, frozen
                limit_amount REAL NOT NULL,
                spent_amount REAL NOT NULL DEFAULT 0,
                color_theme TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.commit()

# Helper for password hashes
def hash_val(val: str) -> str:
    return hashlib.sha256(val.encode("utf-8")).hexdigest()

# Helper to generate numbers
def gen_num(length: int) -> str:
    return "".join([str(random.randint(0, 9)) for _ in range(length)])

# Helper to check auth from cookie
def get_user_from_request() -> int:
    user_id = request.cookies.get("user_id")
    if not user_id:
        return 0
    return int(user_id)

# CORS Header Injector for local React Vite Dev Server (port 5173)
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin in ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000", "http://127.0.0.1:5000"]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response

# Handle preflight requests
@app.route("/api/<path:dummy>", methods=["OPTIONS"])
def handle_options(dummy):
    return "", 204

# ----------------------------------------------------
# AUTH API ENDPOINTS
# ----------------------------------------------------

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    security_pin = data.get("security_pin")

    if not email or not password or not full_name or not security_pin:
        return jsonify({"error": "All registration fields are required."}), 400

    if len(security_pin) != 4 or not security_pin.isdigit():
        return jsonify({"error": "Security PIN must be a 4-digit number."}), 400

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    hashed_pwd = hash_val(password)
    hashed_pin = hash_val(security_pin)
        
    try:
        with connect_db() as conn:
            # Create user
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash, full_name, avatar_url, security_pin, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (email, hashed_pwd, full_name, "", hashed_pin, now)
            )
            user_id = cursor.lastrowid
            
            # Setup standard Checking, Savings and Credit accounts
            routing = "021000021" 
            chk_num = "100" + gen_num(7)
            sav_num = "200" + gen_num(7)
            crd_num = "400" + gen_num(7)
            
            # Insert Checking
            conn.execute(
                "INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, "checking", chk_num, routing, 2500.00, now)
            )
            # Insert Savings
            conn.execute(
                "INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, "savings", sav_num, routing, 5000.00, now)
            )
            # Insert Credit Account
            conn.execute(
                "INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, "credit", crd_num, routing, -300.00, now)
            )
            
            # Insert default virtual card
            v_num = "4111" + gen_num(12)
            cvv = gen_num(3)
            conn.execute(
                "INSERT INTO cards (user_id, card_number, card_holder, expiry, cvv, type, status, limit_amount, spent_amount, color_theme, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (user_id, v_num, full_name, "12/29", cvv, "visa", "active", 1000.0, 0.0, "indigo", now)
            )

            # Insert demo bills
            conn.execute(
                "INSERT INTO bills (user_id, payee, amount, category, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, "Electric Utility Co", 135.0, "utilities", "2026-07-02", "pending", now)
            )
            conn.execute(
                "INSERT INTO bills (user_id, payee, amount, category, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, "Netflix Subscription", 15.99, "entertainment", "2026-06-25", "pending", now)
            )
            
            conn.commit()
            
            # Return user details
            user_row = conn.execute("SELECT id, email, full_name, avatar_url FROM users WHERE id = ?", (user_id,)).fetchone()
            user_dict = dict(user_row)
            
            response = make_response(jsonify({"success": True, "user": user_dict}))
            response.set_cookie(key="user_id", value=str(user_id), httponly=True, samesite="Lax", max_age=86400)
            return response
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists."}), 400

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    hashed_pwd = hash_val(password)
    with connect_db() as conn:
        row = conn.execute(
            "SELECT id, email, full_name, avatar_url FROM users WHERE email = ? AND password_hash = ?",
            (email, hashed_pwd)
        ).fetchone()
        
        if not row:
            return jsonify({"error": "Invalid email or password."}), 400
            
        user_dict = dict(row)
        response = make_response(jsonify({"success": True, "user": user_dict}))
        response.set_cookie(key="user_id", value=str(user_dict["id"]), httponly=True, samesite="Lax", max_age=86400)
        return response

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"success": True}))
    response.delete_cookie(key="user_id")
    return response

@app.route("/api/auth/me", methods=["GET"])
def me():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    with connect_db() as conn:
        row = conn.execute("SELECT id, email, full_name, avatar_url FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 401
        return jsonify({"user": dict(row)})

# ----------------------------------------------------
# BANKING LEDGER
# ----------------------------------------------------

@app.route("/api/accounts", methods=["GET"])
def get_accounts():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    with connect_db() as conn:
        rows = conn.execute("SELECT id, account_type, account_number, routing_number, balance FROM accounts WHERE user_id = ?", (user_id,)).fetchall()
        return jsonify([dict(r) for r in rows])

@app.route("/api/accounts/<int:account_id>/transactions", methods=["GET"])
def get_transactions(account_id):
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    with connect_db() as conn:
        # Verify account belongs to user
        acc = conn.execute("SELECT id FROM accounts WHERE id = ? AND user_id = ?", (account_id, user_id)).fetchone()
        if not acc:
            return jsonify({"error": "Unauthorized account access"}), 403
            
        rows = conn.execute(
            "SELECT id, sender_account_id, recipient_account_id, amount, category, type, status, note, created_at, title FROM transactions WHERE sender_account_id = ? OR recipient_account_id = ? ORDER BY datetime(created_at) DESC",
            (account_id, account_id)
        ).fetchall()
        
        return jsonify({"transactions": [dict(r) for r in rows]})

@app.route("/api/transfers", methods=["POST"])
def make_transfer():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json() or {}
    sender_account_id = data.get("sender_account_id")
    recipient_identifier = data.get("recipient_identifier")
    amount = data.get("amount")
    category = data.get("category", "transfer")
    note = data.get("note", "")
    security_pin = data.get("security_pin")

    if not sender_account_id or not recipient_identifier or amount is None or not security_pin:
        return jsonify({"error": "All fields including security PIN are required."}), 400

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    
    with connect_db() as conn:
        # Check source account owner
        sender_acc = conn.execute(
            "SELECT id, balance, account_number, account_type FROM accounts WHERE id = ? AND user_id = ?",
            (sender_account_id, user_id)
        ).fetchone()
        if not sender_acc:
            return jsonify({"error": "Source account invalid or unauthorized."}), 403
            
        # Check PIN
        hashed_pin = hash_val(security_pin)
        pin_check = conn.execute("SELECT id FROM users WHERE id = ? AND security_pin = ?", (user_id, hashed_pin)).fetchone()
        if not pin_check:
            return jsonify({"error": "Invalid security PIN."}), 400
            
        if amount <= 0:
            return jsonify({"error": "Transfer amount must be positive."}), 400
            
        # Verify Balance rules
        if sender_acc["account_type"] != "credit" and sender_acc["balance"] < amount:
            return jsonify({"error": "Insufficient funds in source account."}), 400
            
        # Locate Recipient account
        recipient_acc = conn.execute(
            """
            SELECT id, balance, user_id, account_number, account_type FROM accounts 
            WHERE account_number = ? 
            OR user_id = (SELECT id FROM users WHERE email = ?)
            LIMIT 1
            """,
            (recipient_identifier, recipient_identifier)
        ).fetchone()
        
        if not recipient_acc:
            return jsonify({"error": "Recipient account not found."}), 404
            
        if recipient_acc["id"] == sender_acc["id"]:
            return jsonify({"error": "Cannot transfer to the same account."}), 400
            
        try:
            # Transaction block
            # Deduct sender
            conn.execute(
                "UPDATE accounts SET balance = balance - ? WHERE id = ?",
                (amount, sender_acc["id"])
            )
            # Add receiver
            conn.execute(
                "UPDATE accounts SET balance = balance + ? WHERE id = ?",
                (amount, recipient_acc["id"])
            )
            
            # Fetch names to label transaction
            sender_name_row = conn.execute("SELECT full_name FROM users WHERE id = ?", (user_id,)).fetchone()
            receiver_name_row = conn.execute("SELECT full_name FROM users WHERE id = ?", (recipient_acc["user_id"],)).fetchone()
            
            sender_name = sender_name_row["full_name"]
            receiver_name = receiver_name_row["full_name"]
            
            # Insert double-entry log
            # Outgoing Transaction
            conn.execute(
                "INSERT INTO transactions (sender_account_id, recipient_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (sender_acc["id"], recipient_acc["id"], -amount, category, "transfer", "completed", note, now, f"To {receiver_name}")
            )
            # Incoming Transaction
            conn.execute(
                "INSERT INTO transactions (sender_account_id, recipient_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (recipient_acc["id"], sender_acc["id"], amount, category, "transfer", "completed", note, now, f"From {sender_name}")
            )
            conn.commit()
            return jsonify({"success": True})
        except Exception as e:
            conn.rollback()
            return jsonify({"error": f"Database execution error: {str(e)}"}), 500

# ----------------------------------------------------
# BILL PAY MODULE
# ----------------------------------------------------

@app.route("/api/bills", methods=["GET"])
def get_bills():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    with connect_db() as conn:
        rows = conn.execute("SELECT id, payee, amount, category, due_date, status FROM bills WHERE user_id = ?", (user_id,)).fetchall()
        return jsonify({"bills": [dict(r) for r in rows]})

@app.route("/api/bills/create", methods=["POST"])
def create_bill():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json() or {}
    payee = data.get("payee")
    amount = data.get("amount")
    category = data.get("category", "bills")
    due_date = data.get("due_date")

    if not payee or amount is None or not due_date:
        return jsonify({"error": "All fields are required"}), 400

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    
    with connect_db() as conn:
        conn.execute(
            "INSERT INTO bills (user_id, payee, amount, category, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, payee, amount, category, due_date, "pending", now)
        )
        conn.commit()
        return jsonify({"success": True})

@app.route("/api/bills/pay", methods=["POST"])
def pay_bill():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json() or {}
    bill_id = data.get("bill_id")
    account_id = data.get("account_id")
    security_pin = data.get("security_pin")

    if not bill_id or not account_id or not security_pin:
        return jsonify({"error": "Missing parameters"}), 400
    
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    
    with connect_db() as conn:
        # Check PIN
        hashed_pin = hash_val(security_pin)
        pin_check = conn.execute("SELECT id FROM users WHERE id = ? AND security_pin = ?", (user_id, hashed_pin)).fetchone()
        if not pin_check:
            return jsonify({"error": "Invalid security PIN."}), 400
            
        # Verify bill belongs to user
        bill = conn.execute("SELECT id, amount, payee, category FROM bills WHERE id = ? AND user_id = ? AND status = 'pending'", (bill_id, user_id)).fetchone()
        if not bill:
            return jsonify({"error": "Active bill invoice not found."}), 404
            
        # Check checking account owner and balance
        chk = conn.execute("SELECT id, balance FROM accounts WHERE id = ? AND user_id = ? AND account_type = 'checking'", (account_id, user_id)).fetchone()
        if not chk:
            return jsonify({"error": "Invalid or unauthorized checking account."}), 403
            
        if chk["balance"] < bill["amount"]:
            return jsonify({"error": "Insufficient funds in checking account."}), 400
            
        try:
            # Deduct Checking balance
            conn.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (bill["amount"], chk["id"]))
            # Update bill status
            conn.execute("UPDATE bills SET status = 'paid' WHERE id = ?", (bill["id"],))
            # Insert transaction ledger
            conn.execute(
                "INSERT INTO transactions (sender_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (chk["id"], -bill["amount"], bill["category"], "bill", "completed", f"Paid bill for {bill['payee']}", now, bill["payee"])
            )
            conn.commit()
            return jsonify({"success": True})
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 500

# ----------------------------------------------------
# VIRTUAL CARDS MODULE
# ----------------------------------------------------

@app.route("/api/cards", methods=["GET"])
def get_cards():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    with connect_db() as conn:
        rows = conn.execute(
            "SELECT id, card_number, card_holder, expiry, cvv, type, status, limit_amount, spent_amount, color_theme FROM cards WHERE user_id = ?",
            (user_id,)
        ).fetchall()
        return jsonify({"cards": [dict(r) for r in rows]})

@app.route("/api/cards/create", methods=["POST"])
def create_card():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json() or {}
    card_type = data.get("type", "visa")
    limit_amount = data.get("limit_amount", 1000)
    color_theme = data.get("color_theme", "indigo")

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    
    with connect_db() as conn:
        user_row = conn.execute("SELECT full_name FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user_row:
            return jsonify({"error": "User not found"}), 404
            
        v_num = ("4" if card_type == "visa" else "5") + gen_num(15)
        cvv = gen_num(3)
        expiry = "12/29"
        
        conn.execute(
            "INSERT INTO cards (user_id, card_number, card_holder, expiry, cvv, type, status, limit_amount, spent_amount, color_theme, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (user_id, v_num, user_row["full_name"], expiry, cvv, card_type, "active", limit_amount, 0.0, color_theme, now)
        )
        conn.commit()
        return jsonify({"success": True})

@app.route("/api/cards/toggle-freeze", methods=["POST"])
def toggle_freeze():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json() or {}
    card_id = data.get("card_id")
    status = data.get("status")

    if status not in ["active", "frozen"]:
        return jsonify({"error": "Invalid card status"}), 400
        
    with connect_db() as conn:
        # Check ownership
        card = conn.execute("SELECT id FROM cards WHERE id = ? AND user_id = ?", (card_id, user_id)).fetchone()
        if not card:
            return jsonify({"error": "Virtual card not found"}), 404
            
        conn.execute("UPDATE cards SET status = ? WHERE id = ?", (status, card_id))
        conn.commit()
        return jsonify({"success": True})

@app.route("/api/cards/update-limit", methods=["POST"])
def update_limit():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json() or {}
    card_id = data.get("card_id")
    limit_amount = data.get("limit_amount")

    if limit_amount is None or limit_amount <= 0:
        return jsonify({"error": "Limit must be positive"}), 400
        
    with connect_db() as conn:
        # Check ownership
        card = conn.execute("SELECT id FROM cards WHERE id = ? AND user_id = ?", (card_id, user_id)).fetchone()
        if not card:
            return jsonify({"error": "Virtual card not found"}), 404
            
        conn.execute("UPDATE cards SET limit_amount = ? WHERE id = ?", (limit_amount, card_id))
        conn.commit()
        return jsonify({"success": True})

# ----------------------------------------------------
# PROFILE UPDATES
# ----------------------------------------------------

@app.route("/api/profile/update-avatar", methods=["POST"])
def update_avatar():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json() or {}
    avatar_url = data.get("avatar_url")
    if not avatar_url:
        return jsonify({"error": "Avatar URL is required"}), 400
        
    with connect_db() as conn:
        conn.execute("UPDATE users SET avatar_url = ? WHERE id = ?", (avatar_url, user_id))
        conn.commit()
        return jsonify({"success": True})

@app.route("/api/profile/update-password", methods=["POST"])
def update_password():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json() or {}
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"error": "Missing old/new password fields"}), 400
        
    hashed_old = hash_val(old_password)
    hashed_new = hash_val(new_password)
    
    with connect_db() as conn:
        user_row = conn.execute("SELECT id FROM users WHERE id = ? AND password_hash = ?", (user_id, hashed_old)).fetchone()
        if not user_row:
            return jsonify({"error": "Current password incorrect."}), 400
            
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hashed_new, user_id))
        conn.commit()
        return jsonify({"success": True})

@app.route("/api/profile/update-pin", methods=["POST"])
def update_pin():
    user_id = get_user_from_request()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json() or {}
    old_pin = data.get("old_pin")
    new_pin = data.get("new_pin")

    if not old_pin or not new_pin:
        return jsonify({"error": "PIN fields are required"}), 400
        
    if len(new_pin) != 4 or not new_pin.isdigit():
        return jsonify({"error": "New PIN must be a 4-digit number."}), 400
        
    hashed_old = hash_val(old_pin)
    hashed_new = hash_val(new_pin)
    
    with connect_db() as conn:
        user_row = conn.execute("SELECT id FROM users WHERE id = ? AND security_pin = ?", (user_id, hashed_old)).fetchone()
        if not user_row:
            return jsonify({"error": "Current PIN incorrect."}), 400
            
        conn.execute("UPDATE users SET security_pin = ? WHERE id = ?", (hashed_new, user_id))
        conn.commit()
        return jsonify({"success": True})

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"ok": True, "service": "paypulse-flask"})

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
    init_db()
    print(f"PayPulse Backend running at http://{HOST}:{PORT}")
    print(f"Database: {DB_PATH}")
    app.run(host=HOST, port=PORT, debug=False)
