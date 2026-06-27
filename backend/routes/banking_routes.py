from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from backend.database.db import connect_db
from backend.services.banking_service import (
    dictionary, deposit_money, withdraw_money, transfer_money,
    add_new_beneficiary, calculate_savings_zakat, deduct_savings_zakat
)
from backend.models.dsa import quicksort_transactions
from backend.utils.helpers import hash_val, gen_num

banking_bp = Blueprint("banking", __name__)


def get_logged_in_user_id():
    user_id = request.cookies.get("user_id")
    if not user_id:
        return 0
    return int(user_id)


# ─── Accounts ─────────────────────────────────────────────────────────────────

@banking_bp.route("/api/accounts", methods=["GET"])
def get_accounts():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    with connect_db() as conn:
        rows = conn.execute("""
            SELECT id, account_type, account_number, routing_number, balance,
                   available_balance, status, customer_id, debit_card_number, zakat_enabled
            FROM accounts
            WHERE user_id = ?
        """, (user_id,)).fetchall()
        return jsonify([dict(r) for r in rows])


@banking_bp.route("/api/accounts/<int:account_id>/transactions", methods=["GET"])
def get_transactions(account_id):
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    sort_by = request.args.get("sort_by", "created_at")
    order   = request.args.get("order", "desc")   # 'desc' or 'asc'

    with connect_db() as conn:
        acc = conn.execute(
            "SELECT id FROM accounts WHERE id = ? AND user_id = ?",
            (account_id, user_id)
        ).fetchone()
        if not acc:
            return jsonify({"error": "Unauthorized account access"}), 403

        rows = conn.execute("""
            SELECT id, sender_account_id, recipient_account_id, amount, category,
                   type, status, note, created_at, title, is_undone
            FROM transactions
            WHERE sender_account_id = ? OR recipient_account_id = ?
        """, (account_id, account_id)).fetchall()

        tx_list = [dict(r) for r in rows]
        # DEMONSTRATION: Custom QuickSort sorts the transaction list in-memory
        sorted_tx = quicksort_transactions(tx_list, key=sort_by, reverse=(order == "desc"))
        return jsonify({"transactions": sorted_tx})


# ─── Virtual Cards ─────────────────────────────────────────────────────────────

@banking_bp.route("/api/cards", methods=["GET"])
def get_cards():
    """Return all virtual cards belonging to the authenticated user."""
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    with connect_db() as conn:
        rows = conn.execute("""
            SELECT id, card_number, card_holder, expiry, cvv, type,
                   status, limit_amount, spent_amount, color_theme, created_at
            FROM cards
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,)).fetchall()
        return jsonify({"cards": [dict(r) for r in rows]})


@banking_bp.route("/api/cards/create", methods=["POST"])
def create_card():
    """Provision a new virtual card for the authenticated user."""
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data         = request.get_json() or {}
    card_type    = data.get("type", "visa")
    limit_amount = data.get("limit_amount", 5000.0)
    color_theme  = data.get("color_theme", "navy")

    if card_type not in ("visa", "mastercard"):
        return jsonify({"error": "Card type must be 'visa' or 'mastercard'."}), 400

    try:
        limit_amount = float(limit_amount)
        if limit_amount < 1000 or limit_amount > 100000:
            return jsonify({"error": "Card limit must be between PKR 1,000 and PKR 100,000."}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid limit amount."}), 400

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    with connect_db() as conn:
        # Fetch user's full name for the card holder field
        user_row = conn.execute(
            "SELECT full_name FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        if not user_row:
            return jsonify({"error": "User not found."}), 404

        card_holder = user_row["full_name"]

        # Generate unique 16-digit card number
        prefix     = "4214" if card_type == "visa" else "5412"
        card_number = prefix + gen_num(12)
        cvv        = gen_num(3)
        expiry     = "12/29"

        conn.execute("""
            INSERT INTO cards
                (user_id, card_number, card_holder, expiry, cvv, type,
                 status, limit_amount, spent_amount, color_theme, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, card_number, card_holder, expiry, cvv, card_type,
              "active", limit_amount, 0.0, color_theme, now))
        conn.commit()

        new_card_id = conn.execute(
            "SELECT id FROM cards WHERE card_number = ?", (card_number,)
        ).fetchone()["id"]

        return jsonify({
            "success": True,
            "card": {
                "id": new_card_id,
                "card_number": card_number,
                "card_holder": card_holder,
                "expiry": expiry,
                "cvv": cvv,
                "type": card_type,
                "status": "active",
                "limit_amount": limit_amount,
                "spent_amount": 0.0,
                "color_theme": color_theme,
                "created_at": now
            }
        })


@banking_bp.route("/api/cards/toggle-freeze", methods=["POST"])
def toggle_card_freeze():
    """Freeze or unfreeze a virtual card owned by the authenticated user."""
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data      = request.get_json() or {}
    card_id   = data.get("card_id")
    new_status = data.get("status")   # 'active' or 'frozen'

    if not card_id or new_status not in ("active", "frozen"):
        return jsonify({"error": "card_id and status ('active' or 'frozen') are required."}), 400

    with connect_db() as conn:
        card = conn.execute(
            "SELECT id FROM cards WHERE id = ? AND user_id = ?",
            (card_id, user_id)
        ).fetchone()
        if not card:
            return jsonify({"error": "Card not found or access denied."}), 404

        conn.execute(
            "UPDATE cards SET status = ? WHERE id = ?",
            (new_status, card_id)
        )
        conn.commit()
        return jsonify({"success": True, "status": new_status})


@banking_bp.route("/api/cards/update-limit", methods=["POST"])
def update_card_limit():
    """Update the spending limit on a virtual card owned by the authenticated user."""
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data         = request.get_json() or {}
    card_id      = data.get("card_id")
    limit_amount = data.get("limit_amount")

    if not card_id or limit_amount is None:
        return jsonify({"error": "card_id and limit_amount are required."}), 400

    try:
        limit_amount = float(limit_amount)
        if limit_amount < 1000 or limit_amount > 100000:
            return jsonify({"error": "Limit must be between PKR 1,000 and PKR 100,000."}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid limit amount."}), 400

    with connect_db() as conn:
        card = conn.execute(
            "SELECT id FROM cards WHERE id = ? AND user_id = ?",
            (card_id, user_id)
        ).fetchone()
        if not card:
            return jsonify({"error": "Card not found or access denied."}), 404

        conn.execute(
            "UPDATE cards SET limit_amount = ? WHERE id = ?",
            (limit_amount, card_id)
        )
        conn.commit()
        return jsonify({"success": True, "limit_amount": limit_amount})


# ─── Transfers ────────────────────────────────────────────────────────────────

@banking_bp.route("/api/transfers", methods=["POST"])
def make_transfer():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data                 = request.get_json() or {}
    sender_account_id    = data.get("sender_account_id")
    recipient_identifier = data.get("recipient_identifier")
    amount               = data.get("amount")
    category             = data.get("category", "transfer")
    note                 = data.get("note", "")
    security_pin         = data.get("security_pin")
    is_express           = data.get("is_express", True)

    if not sender_account_id or not recipient_identifier or amount is None or not security_pin:
        return jsonify({"error": "All fields including security PIN are required."}), 400

    try:
        status_msg = transfer_money(
            sender_acc_id=int(sender_account_id),
            recipient_identifier=recipient_identifier.strip(),
            amount=float(amount),
            category=category,
            note=note,
            security_pin=security_pin,
            is_express=is_express
        )
        return jsonify({"success": True, "status": status_msg})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal execution error: {str(e)}"}), 500


# ─── Bills ────────────────────────────────────────────────────────────────────

@banking_bp.route("/api/bills", methods=["GET"])
def get_bills():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    with connect_db() as conn:
        rows = conn.execute(
            "SELECT id, payee, amount, category, due_date, status FROM bills WHERE user_id = ?",
            (user_id,)
        ).fetchall()
        return jsonify({"bills": [dict(r) for r in rows]})


@banking_bp.route("/api/bills/add", methods=["POST"])
def add_bill():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data     = request.get_json() or {}
    payee    = data.get("payee")
    amount   = data.get("amount")
    category = data.get("category", "utilities")
    due_date = data.get("due_date")

    if not payee or amount is None or not due_date:
        return jsonify({"error": "Payee, amount, and due date are required."}), 400

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with connect_db() as conn:
        conn.execute(
            "INSERT INTO bills (user_id, payee, amount, category, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, payee, float(amount), category, due_date, "pending", now)
        )
        conn.commit()
        return jsonify({"success": True})


@banking_bp.route("/api/bills/pay", methods=["POST"])
def pay_bill():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data         = request.get_json() or {}
    bill_id      = data.get("bill_id")
    account_id   = data.get("account_id")
    security_pin = data.get("security_pin")

    if not bill_id or not account_id or not security_pin:
        return jsonify({"error": "Missing bill payment parameters"}), 400

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    with connect_db() as conn:
        hashed_pin = hash_val(security_pin)
        pin_check = conn.execute(
            "SELECT id FROM users WHERE id = ? AND security_pin = ?",
            (user_id, hashed_pin)
        ).fetchone()
        if not pin_check:
            return jsonify({"error": "Invalid security PIN."}), 400

        bill = conn.execute(
            "SELECT * FROM bills WHERE id = ? AND user_id = ? AND status = 'pending'",
            (bill_id, user_id)
        ).fetchone()
        if not bill:
            return jsonify({"error": "Active bill invoice not found."}), 404

        chk = conn.execute(
            "SELECT * FROM accounts WHERE id = ? AND user_id = ?",
            (account_id, user_id)
        ).fetchone()
        if not chk or chk["account_type"] != "checking":
            return jsonify({"error": "Must pay bills using an authorized checking account."}), 400
        if chk["status"] == "frozen":
            return jsonify({"error": "Account is frozen. Transactions are disabled."}), 400
        if chk["available_balance"] < bill["amount"]:
            return jsonify({"error": "Insufficient funds in checking account."}), 400

        try:
            new_bal   = chk["balance"] - bill["amount"]
            new_avail = chk["available_balance"] - bill["amount"]

            conn.execute(
                "UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?",
                (new_bal, new_avail, chk["id"])
            )
            conn.execute("UPDATE bills SET status = 'paid' WHERE id = ?", (bill["id"],))

            cursor = conn.execute(
                "INSERT INTO transactions (sender_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (chk["id"], -bill["amount"], bill["category"], "bill", "completed",
                 f"Bill Payment to {bill['payee']}", now, bill["payee"])
            )
            tx_id = cursor.lastrowid
            conn.commit()

            dictionary.update_balance(chk["account_number"], new_bal, new_avail)

            tx_row = conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()
            from backend.services.banking_service import stack
            stack.push(dict(tx_row))

            return jsonify({"success": True})
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 500


# ─── Beneficiaries ────────────────────────────────────────────────────────────

@banking_bp.route("/api/beneficiaries", methods=["GET"])
def get_beneficiaries():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    with connect_db() as conn:
        rows = conn.execute(
            "SELECT id, name, account_number, created_at FROM beneficiaries WHERE user_id = ?",
            (user_id,)
        ).fetchall()
        return jsonify([dict(r) for r in rows])


@banking_bp.route("/api/beneficiaries", methods=["POST"])
def add_beneficiary():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data           = request.get_json() or {}
    name           = data.get("name")
    account_number = data.get("account_number")

    if not name or not account_number:
        return jsonify({"error": "Name and Account Number are required."}), 400

    try:
        add_new_beneficiary(user_id, name, account_number)
        return jsonify({"success": True})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@banking_bp.route("/api/beneficiaries/<int:ben_id>", methods=["DELETE"])
def delete_beneficiary(ben_id):
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    with connect_db() as conn:
        result = conn.execute(
            "DELETE FROM beneficiaries WHERE id = ? AND user_id = ?",
            (ben_id, user_id)
        )
        conn.commit()
        if result.rowcount == 0:
            return jsonify({"error": "Beneficiary not found."}), 404
        return jsonify({"success": True})


# ─── Zakat ────────────────────────────────────────────────────────────────────

@banking_bp.route("/api/zakat/toggle", methods=["POST"])
def toggle_zakat():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data       = request.get_json() or {}
    account_id = data.get("account_id")

    if not account_id:
        return jsonify({"error": "Account ID is required."}), 400

    with connect_db() as conn:
        acc = conn.execute(
            "SELECT id, zakat_enabled, account_number FROM accounts WHERE id = ? AND user_id = ?",
            (account_id, user_id)
        ).fetchone()
        if not acc:
            return jsonify({"error": "Account not found or unauthorized."}), 404

        new_state = 0 if acc["zakat_enabled"] == 1 else 1
        conn.execute("UPDATE accounts SET zakat_enabled = ? WHERE id = ?", (new_state, account_id))
        conn.commit()

        dictionary.accounts_map[acc["account_number"]]["zakat_enabled"] = new_state
        return jsonify({"success": True, "zakat_enabled": new_state})


@banking_bp.route("/api/zakat/calculate/<account_number>", methods=["GET"])
def get_zakat_calc(account_number):
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    try:
        calc = calculate_savings_zakat(account_number)
        return jsonify(calc)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@banking_bp.route("/api/zakat/deduct", methods=["POST"])
def deduct_zakat():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data           = request.get_json() or {}
    account_number = data.get("account_number")

    if not account_number:
        return jsonify({"error": "Account Number is required."}), 400

    try:
        res = deduct_savings_zakat(account_number)
        return jsonify({"success": True, "balance": res["balance"], "zakat_paid": res["zakat_paid"]})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


# ─── Sandbox Utilities ────────────────────────────────────────────────────────

@banking_bp.route("/api/deposit", methods=["POST"])
def make_deposit():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data           = request.get_json() or {}
    account_number = data.get("account_number")
    amount         = data.get("amount")
    note           = data.get("note", "Cash Deposit")

    if not account_number or amount is None:
        return jsonify({"error": "Account Number and Amount are required."}), 400

    try:
        res = deposit_money(account_number, float(amount), note)
        return jsonify({"success": True, "balance": res["balance"], "available_balance": res["available_balance"]})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@banking_bp.route("/api/withdraw", methods=["POST"])
def make_withdrawal():
    user_id = get_logged_in_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data           = request.get_json() or {}
    account_number = data.get("account_number")
    amount         = data.get("amount")
    note           = data.get("note", "Cash Withdrawal")
    security_pin   = data.get("security_pin")

    if not account_number or amount is None or not security_pin:
        return jsonify({"error": "Account Number, Amount, and PIN are required."}), 400

    with connect_db() as conn:
        user_row = conn.execute("SELECT security_pin FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user_row or user_row["security_pin"] != hash_val(security_pin):
            return jsonify({"error": "Invalid security PIN."}), 400

    try:
        res = withdraw_money(account_number, float(amount), note)
        return jsonify({"success": True, "balance": res["balance"], "available_balance": res["available_balance"]})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
