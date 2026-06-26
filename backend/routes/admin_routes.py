from flask import Blueprint, request, jsonify
from backend.database.db import connect_db
from backend.services.banking_service import (
    stack, queue, dictionary, process_next_pending_transaction, 
    reject_pending_transaction, undo_last_transaction
)

admin_bp = Blueprint("admin", __name__)

def is_admin_user() -> bool:
    user_id = request.cookies.get("user_id")
    if not user_id:
        return False
    with connect_db() as conn:
        row = conn.execute("SELECT is_admin FROM users WHERE id = ?", (user_id,)).fetchone()
        return bool(row and row["is_admin"] == 1)

@admin_bp.before_request
def restrict_to_admins():
    # Options request for preflight passes through
    if request.method == "OPTIONS":
        return
    if not is_admin_user():
        return jsonify({"error": "Admin access required."}), 403

@admin_bp.route("/api/admin/users", methods=["GET"])
def get_all_users():
    with connect_db() as conn:
        users = conn.execute("SELECT id, email, full_name, cnic, mobile, created_at FROM users WHERE is_admin = 0").fetchall()
        user_list = []
        for u in users:
            u_dict = dict(u)
            # Find accounts
            accs = conn.execute("SELECT id, account_type, account_number, balance, available_balance, status FROM accounts WHERE user_id = ?", (u["id"],)).fetchall()
            u_dict["accounts"] = [dict(a) for a in accs]
            user_list.append(u_dict)
        return jsonify({"users": user_list})

@admin_bp.route("/api/admin/freeze", methods=["POST"])
def freeze_account():
    data = request.get_json() or {}
    account_number = data.get("account_number")
    status = data.get("status") # 'active' or 'frozen'

    if not account_number or status not in ["active", "frozen"]:
        return jsonify({"error": "Missing or invalid account freeze state parameters."}), 400

    with connect_db() as conn:
        acc = conn.execute("SELECT id FROM accounts WHERE account_number = ?", (account_number,)).fetchone()
        if not acc:
            return jsonify({"error": "Account not found."}), 404
            
        conn.execute("UPDATE accounts SET status = ? WHERE account_number = ?", (status, account_number))
        conn.commit()
        
        # Sync Cache
        dictionary.update_status(account_number, status)
        return jsonify({"success": True, "status": status})

@admin_bp.route("/api/admin/queue", methods=["GET"])
def get_pending_queue():
    # Return pending queue elements
    return jsonify({"queue": queue.items})

@admin_bp.route("/api/admin/queue/process", methods=["POST"])
def process_queue_item():
    try:
        res = process_next_pending_transaction()
        return jsonify({"success": True, "processed_id": res["processed_id"]})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal execution error: {str(e)}"}), 500

@admin_bp.route("/api/admin/queue/reject", methods=["POST"])
def reject_queue_item():
    data = request.get_json() or {}
    req_id = data.get("id")
    
    if not req_id:
        return jsonify({"error": "Transaction ID is required."}), 400
        
    try:
        reject_pending_transaction(int(req_id))
        return jsonify({"success": True})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route("/api/admin/undo", methods=["POST"])
def trigger_undo():
    try:
        res = undo_last_transaction()
        return jsonify({"success": True, "reversed_tx_id": res["reversed_tx_id"]})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal reversal error: {str(e)}"}), 500

@admin_bp.route("/api/admin/logs", methods=["GET"])
def get_transaction_logs():
    with connect_db() as conn:
        rows = conn.execute("""
            SELECT t.id, t.sender_account_id, t.recipient_account_id, t.amount, 
                   t.category, t.type, t.status, t.note, t.created_at, t.title, t.is_undone,
                   u.full_name as sender_name, u.email as sender_email
            FROM transactions t
            LEFT JOIN accounts a ON t.sender_account_id = a.id
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY t.id DESC
        """).fetchall()
        
        # Build stack size response header
        stack_size = stack.size()
        return jsonify({"logs": [dict(r) for r in rows], "stack_size": stack_size})
