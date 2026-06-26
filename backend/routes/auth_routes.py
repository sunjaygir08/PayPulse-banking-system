from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, make_response
from backend.database.db import connect_db
from backend.utils.helpers import hash_val, gen_num, generate_debit_card, validate_cnic, validate_mobile
from backend.services.banking_service import dictionary

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    security_pin = data.get("security_pin")
    cnic = data.get("cnic")
    mobile = data.get("mobile")

    if not email or not password or not full_name or not security_pin or not cnic or not mobile:
        return jsonify({"error": "All registration fields (Full Name, CNIC, Mobile, Email, Password, Security PIN) are required."}), 400

    if not validate_cnic(cnic):
        return jsonify({"error": "Invalid CNIC format. Expected: XXXXX-XXXXXXX-X (e.g. 42101-1234567-1)"}), 400

    if not validate_mobile(mobile):
        return jsonify({"error": "Invalid Mobile Number. Expected: 03XX-XXXXXXX (e.g. 0300-1234567)"}), 400

    if len(security_pin) != 4 or not security_pin.isdigit():
        return jsonify({"error": "Security PIN must be a 4-digit number."}), 400

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    hashed_pwd = hash_val(password)
    hashed_pin = hash_val(security_pin)
        
    try:
        with connect_db() as conn:
            # Check duplicate email
            dup = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            if dup:
                return jsonify({"error": "Email is already registered."}), 400
                
            # Create user
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash, full_name, avatar_url, security_pin, cnic, mobile, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (email, hashed_pwd, full_name, "", hashed_pin, cnic, mobile, 0, now)
            )
            user_id = cursor.lastrowid
            
            # Setup Account numbers, Customer ID, and Card values
            routing = "021000021" 
            customer_id = "CID-" + gen_num(6)
            
            # Standard PKR values (pk stands for PKR currency context)
            chk_num = "100" + gen_num(7)
            sav_num = "200" + gen_num(7)
            crd_num = "400" + gen_num(7)
            
            chk_card = generate_debit_card(full_name)
            sav_card = generate_debit_card(full_name)
            crd_card = generate_debit_card(full_name)
            
            # Insert Checking (initial balance: 5000.00 PKR)
            conn.execute(
                "INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, available_balance, status, customer_id, debit_card_number, zakat_enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (user_id, "checking", chk_num, routing, 5000.00, 5000.00, "active", customer_id, chk_card, 0, now)
            )
            # Insert Savings (initial balance: 10000.00 PKR)
            conn.execute(
                "INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, available_balance, status, customer_id, debit_card_number, zakat_enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (user_id, "savings", sav_num, routing, 10000.00, 10000.00, "active", customer_id, sav_card, 1, now)
            )
            # Insert Credit Account (starting balance: -1500.00 PKR, limit: 5000.00 PKR, available limit: 3500.00 PKR)
            conn.execute(
                "INSERT INTO accounts (user_id, account_type, account_number, routing_number, balance, available_balance, status, customer_id, debit_card_number, zakat_enabled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (user_id, "credit", crd_num, routing, -1500.00, 3500.00, "active", customer_id, crd_card, 0, now)
            )
            
            # Insert virtual card
            v_num = "4214" + gen_num(12)
            cvv = gen_num(3)
            conn.execute(
                "INSERT INTO cards (user_id, card_number, card_holder, expiry, cvv, type, status, limit_amount, spent_amount, color_theme, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (user_id, v_num, full_name, "12/29", cvv, "visa", "active", 5000.0, 1500.0, "indigo", now)
            )

            # Insert default invoices/bills
            conn.execute(
                "INSERT INTO bills (user_id, payee, amount, category, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, "K-Electric Corp", 1850.0, "utilities", "2026-07-02", "pending", now)
            )
            conn.execute(
                "INSERT INTO bills (user_id, payee, amount, category, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, "Sui Southern Gas Co", 450.00, "utilities", "2026-06-25", "pending", now)
            )
            
            conn.commit()
            
            # Populate dictionary cache in-memory for O(1) lookups
            dictionary.put(chk_num, {
                "id": user_id + 1, # mock id mapping or reload
                "user_id": user_id,
                "account_type": "checking",
                "account_number": chk_num,
                "routing_number": routing,
                "balance": 5000.00,
                "available_balance": 5000.00,
                "status": "active",
                "customer_id": customer_id,
                "debit_card_number": chk_card,
                "zakat_enabled": 0,
                "full_name": full_name
            })
            dictionary.put(sav_num, {
                "id": user_id + 2,
                "user_id": user_id,
                "account_type": "savings",
                "account_number": sav_num,
                "routing_number": routing,
                "balance": 10000.00,
                "available_balance": 10000.00,
                "status": "active",
                "customer_id": customer_id,
                "debit_card_number": sav_card,
                "zakat_enabled": 1,
                "full_name": full_name
            })
            dictionary.put(crd_num, {
                "id": user_id + 3,
                "user_id": user_id,
                "account_type": "credit",
                "account_number": crd_num,
                "routing_number": routing,
                "balance": -1500.00,
                "available_balance": 3500.00,
                "status": "active",
                "customer_id": customer_id,
                "debit_card_number": crd_card,
                "zakat_enabled": 0,
                "full_name": full_name
            })

            # Retrieve user details
            user_row = conn.execute("SELECT id, email, full_name, avatar_url, cnic, mobile, is_admin, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
            user_dict = dict(user_row)
            
            response = make_response(jsonify({"success": True, "user": user_dict}))
            response.set_cookie(key="user_id", value=str(user_id), httponly=True, samesite="Lax", max_age=86400)
            return response
    except sqlite3.IntegrityError:
        return jsonify({"error": "Registration failed. Details already exist."}), 400

@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    hashed_pwd = hash_val(password)
    with connect_db() as conn:
        row = conn.execute(
            "SELECT id, email, full_name, avatar_url, cnic, mobile, is_admin, created_at FROM users WHERE email = ? AND password_hash = ?",
            (email, hashed_pwd)
        ).fetchone()
        
        if not row:
            return jsonify({"error": "Invalid email or password."}), 400
            
        user_dict = dict(row)
        response = make_response(jsonify({"success": True, "user": user_dict}))
        response.set_cookie(key="user_id", value=str(user_dict["id"]), httponly=True, samesite="Lax", max_age=86400)
        return response

@auth_bp.route("/api/auth/logout", methods=["POST"])
def logout():
    response = make_response(jsonify({"success": True}))
    response.delete_cookie(key="user_id")
    return response

@auth_bp.route("/api/auth/me", methods=["GET"])
def me():
    user_id = request.cookies.get("user_id")
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    with connect_db() as conn:
        row = conn.execute("SELECT id, email, full_name, avatar_url, cnic, mobile, is_admin, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 401
        return jsonify({"user": dict(row)})
