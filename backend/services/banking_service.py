import sqlite3
from datetime import datetime, timezone
from backend.database.db import connect_db
from backend.models.dsa import TransactionStack, PendingTransactionQueue, AccountDictionary, quicksort_transactions
from backend.utils.helpers import hash_val

# Initialize Global DSA Instances
stack = TransactionStack()
queue = PendingTransactionQueue()
dictionary = AccountDictionary()

def load_caches_from_db():
    """
    Populate in-memory DSA structures from SQLite database on system startup.
    1. Load all accounts into Dictionary for fast O(1) lookups.
    2. Load pending transactions into Queue for FIFO processing.
    3. Load last 100 completed transactions into Stack for LIFO admin undo.
    """
    global stack, queue, dictionary
    stack.clear()
    queue.items = [] # reset queue
    dictionary.clear()

    with connect_db() as conn:
        # 1. Load accounts into Dictionary
        accounts = conn.execute("""
            SELECT a.id, a.user_id, a.account_type, a.account_number, 
                   a.routing_number, a.balance, a.available_balance, a.status, 
                   a.customer_id, a.debit_card_number, a.zakat_enabled, u.full_name
            FROM accounts a
            JOIN users u ON a.user_id = u.id
        """).fetchall()
        for acc in accounts:
            acc_data = dict(acc)
            dictionary.put(acc_data["account_number"], acc_data)

        # 2. Load pending transactions into Queue
        pending = conn.execute(
            "SELECT id, sender_account_number, recipient_account_number, amount, category, type, note, status, created_at FROM pending_transactions WHERE status = 'pending' ORDER BY id ASC"
        ).fetchall()
        for p in pending:
            queue.enqueue(dict(p))

        # 3. Load last 100 valid transactions into Stack
        # We push them in chronological order so the latest transaction ends up at the top
        transactions = conn.execute("""
            SELECT id, sender_account_id, recipient_account_id, amount, category, type, status, note, created_at, title, is_undone
            FROM transactions 
            WHERE is_undone = 0 
            ORDER BY id ASC
            LIMIT 100
        """).fetchall()
        for t in transactions:
            stack.push(dict(t))

def deposit_money(account_number: str, amount: float, note: str = "Deposit") -> dict:
    if amount <= 0:
        raise ValueError("Deposit amount must be positive.")
        
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    acc = dictionary.get(account_number)
    if not acc:
        raise ValueError("Account not found.")
    if acc["status"] == "frozen":
        raise ValueError("Account is frozen. Transactions are disabled.")

    new_bal = acc["balance"] + amount
    new_avail = acc["available_balance"] + amount

    with connect_db() as conn:
        conn.execute(
            "UPDATE accounts SET balance = ?, available_balance = ? WHERE account_number = ?",
            (new_bal, new_avail, account_number)
        )
        # Log Transaction
        cursor = conn.execute(
            "INSERT INTO transactions (sender_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (acc["id"], amount, "deposit", "deposit", "completed", note, now, "Cash Deposit")
        )
        tx_id = cursor.lastrowid
        conn.commit()

        # Update cache
        dictionary.update_balance(account_number, new_bal, new_avail)
        
        # Load tx details to push onto Stack
        tx_row = conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()
        tx_dict = dict(tx_row)
        stack.push(tx_dict)
        
        return {"balance": new_bal, "available_balance": new_avail}

def withdraw_money(account_number: str, amount: float, note: str = "Withdrawal") -> dict:
    if amount <= 0:
        raise ValueError("Withdrawal amount must be positive.")
        
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    acc = dictionary.get(account_number)
    if not acc:
        raise ValueError("Account not found.")
    if acc["status"] == "frozen":
        raise ValueError("Account is frozen. Transactions are disabled.")
        
    if acc["account_type"] != "credit" and acc["available_balance"] < amount:
        raise ValueError("Insufficient available balance.")

    new_bal = acc["balance"] - amount
    new_avail = acc["available_balance"] - amount

    with connect_db() as conn:
        conn.execute(
            "UPDATE accounts SET balance = ?, available_balance = ? WHERE account_number = ?",
            (new_bal, new_avail, account_number)
        )
        # Log Transaction
        cursor = conn.execute(
            "INSERT INTO transactions (sender_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (acc["id"], -amount, "withdrawal", "withdrawal", "completed", note, now, "Cash Withdrawal")
        )
        tx_id = cursor.lastrowid
        conn.commit()

        # Update cache
        dictionary.update_balance(account_number, new_bal, new_avail)
        
        # Push onto Stack
        tx_row = conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()
        tx_dict = dict(tx_row)
        stack.push(tx_dict)
        
        return {"balance": new_bal, "available_balance": new_avail}

def transfer_money(sender_acc_id: int, recipient_identifier: str, amount: float, 
                   category: str, note: str, security_pin: str, is_express: bool = True) -> str:
    """
    Perform a fund transfer.
    If is_express is True: Immediate Execution.
    If is_express is False: Queued (appended to FIFO Queue for admin approval).
    """
    if amount <= 0:
        raise ValueError("Transfer amount must be positive.")
        
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    
    with connect_db() as conn:
        # Check source account
        sender_row = conn.execute("SELECT * FROM accounts WHERE id = ?", (sender_acc_id,)).fetchone()
        if not sender_row:
            raise ValueError("Sender account not found.")
        sender_acc = dict(sender_row)
        
        # Verify PIN
        user_row = conn.execute("SELECT security_pin, full_name FROM users WHERE id = ?", (sender_acc["user_id"],)).fetchone()
        if not user_row or user_row["security_pin"] != hash_val(security_pin):
            raise ValueError("Invalid security PIN.")
            
        if sender_acc["status"] == "frozen":
            raise ValueError("Your account is frozen. Transactions are disabled.")

        # Check balance rules
        if sender_acc["account_type"] != "credit" and sender_acc["available_balance"] < amount:
            raise ValueError("Insufficient available balance.")
            
        # Locate Recipient Account
        # Can check by account number or search in our Dictionary Cache
        recipient_acc = None
        # Check by direct account number in cache
        recipient_acc = dictionary.get(recipient_identifier)
        
        if not recipient_acc:
            # Fallback check db for email
            rec_user = conn.execute("SELECT id FROM users WHERE email = ?", (recipient_identifier,)).fetchone()
            if rec_user:
                rec_acc_row = conn.execute("SELECT account_number FROM accounts WHERE user_id = ? AND account_type = 'checking'", (rec_user["id"],)).fetchone()
                if rec_acc_row:
                    recipient_acc = dictionary.get(rec_acc_row["account_number"])
                    
        if not recipient_acc:
            raise ValueError("Recipient account not found.")
            
        if recipient_acc["account_number"] == sender_acc["account_number"]:
            raise ValueError("Cannot transfer to the same account.")
            
        if recipient_acc["status"] == "frozen":
            raise ValueError("Recipient account is frozen. Deposits are disabled.")

        if is_express:
            # Immediate Execution
            try:
                new_sender_bal = sender_acc["balance"] - amount
                new_sender_avail = sender_acc["available_balance"] - amount
                new_rec_bal = recipient_acc["balance"] + amount
                new_rec_avail = recipient_acc["available_balance"] + amount
                
                # Execute in database
                conn.execute("UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?", 
                             (new_sender_bal, new_sender_avail, sender_acc["id"]))
                conn.execute("UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?", 
                             (new_rec_bal, new_rec_avail, recipient_acc["id"]))
                
                # Double Entry Transaction Log
                tx_title_to = f"To {recipient_acc['full_name']}"
                tx_title_from = f"From {user_row['full_name']}"
                
                # Debit Sender
                cursor = conn.execute(
                    "INSERT INTO transactions (sender_account_id, recipient_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (sender_acc["id"], recipient_acc["id"], -amount, category, "transfer", "completed", note, now, tx_title_to)
                )
                tx_id = cursor.lastrowid
                
                # Credit Receiver
                conn.execute(
                    "INSERT INTO transactions (sender_account_id, recipient_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (recipient_acc["id"], sender_acc["id"], amount, category, "transfer", "completed", note, now, tx_title_from)
                )
                
                conn.commit()
                
                # Sync Caches
                dictionary.update_balance(sender_acc["account_number"], new_sender_bal, new_sender_avail)
                dictionary.update_balance(recipient_acc["account_number"], new_rec_bal, new_rec_avail)
                
                # Push onto Stack
                tx_row = conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()
                stack.push(dict(tx_row))
                
                return "success"
            except Exception as e:
                conn.rollback()
                raise e
        else:
            # Queued Processing (FIFO Queue)
            # Subtract from sender's Available Balance immediately so they can't double-spend!
            # The Current Balance remains unchanged until the transaction is approved/dequeued.
            try:
                new_sender_avail = sender_acc["available_balance"] - amount
                conn.execute("UPDATE accounts SET available_balance = ? WHERE id = ?", (new_sender_avail, sender_acc["id"]))
                
                # Insert pending request in database
                cursor = conn.execute(
                    "INSERT INTO pending_transactions (sender_account_number, recipient_account_number, amount, category, type, note, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (sender_acc["account_number"], recipient_acc["account_number"], amount, category, "transfer", note, "pending", now)
                )
                req_id = cursor.lastrowid
                conn.commit()
                
                # Sync caches
                dictionary.update_balance(sender_acc["account_number"], sender_acc["balance"], new_sender_avail)
                
                # Enqueue in-memory
                req_data = {
                    "id": req_id,
                    "sender_account_number": sender_acc["account_number"],
                    "recipient_account_number": recipient_acc["account_number"],
                    "amount": amount,
                    "category": category,
                    "type": "transfer",
                    "note": note,
                    "status": "pending",
                    "created_at": now
                }
                queue.enqueue(req_data)
                
                return "queued"
            except Exception as e:
                conn.rollback()
                raise e

def process_next_pending_transaction() -> dict:
    """
    FIFO Queue Processing.
    Dequeues the next transaction request from PendingTransactionQueue and processes it.
    """
    if queue.is_empty():
        raise ValueError("Pending transaction approval queue is empty.")
        
    req = queue.dequeue()
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    
    with connect_db() as conn:
        # Verify transaction request still exists in db
        req_row = conn.execute("SELECT * FROM pending_transactions WHERE id = ? AND status = 'pending'", (req["id"],)).fetchone()
        if not req_row:
            raise ValueError("Transaction request has already been processed or canceled.")
            
        sender_acc = dictionary.get(req["sender_account_number"])
        recipient_acc = dictionary.get(req["recipient_account_number"])
        amount = req["amount"]
        
        if not sender_acc or not recipient_acc:
            # Mark as failed in DB
            conn.execute("UPDATE pending_transactions SET status = 'failed' WHERE id = ?", (req["id"],))
            conn.commit()
            raise ValueError("Accounts involved are no longer available.")
            
        try:
            # Execute Ledger calculations
            # Sender available balance was already deducted during enqueue.
            # Now deduct Current balance.
            new_sender_bal = sender_acc["balance"] - amount
            
            # Receiver gets both current and available balances
            new_rec_bal = recipient_acc["balance"] + amount
            new_rec_avail = recipient_acc["available_balance"] + amount
            
            conn.execute("UPDATE accounts SET balance = ? WHERE id = ?", (new_sender_bal, sender_acc["id"]))
            conn.execute("UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?", 
                         (new_rec_bal, new_rec_avail, recipient_acc["id"]))
            
            # Set request status in DB
            conn.execute("UPDATE pending_transactions SET status = 'processed' WHERE id = ?", (req["id"],))
            
            # Log completed Transaction entries
            # Debit
            cursor = conn.execute(
                "INSERT INTO transactions (sender_account_id, recipient_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (sender_acc["id"], recipient_acc["id"], -amount, req["category"], "transfer", "completed", req["note"], now, f"To {recipient_acc['full_name']}")
            )
            tx_id = cursor.lastrowid
            
            # Credit
            conn.execute(
                "INSERT INTO transactions (sender_account_id, recipient_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (recipient_acc["id"], sender_acc["id"], amount, req["category"], "transfer", "completed", req["note"], now, f"From {sender_acc['full_name']}")
            )
            
            conn.commit()
            
            # Update cache balances
            dictionary.update_balance(sender_acc["account_number"], new_sender_bal, sender_acc["available_balance"])
            dictionary.update_balance(recipient_acc["account_number"], new_rec_bal, new_rec_avail)
            
            # Push completed action to Stack
            tx_row = conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()
            stack.push(dict(tx_row))
            
            return {"success": True, "processed_id": req["id"]}
            
        except Exception as e:
            conn.rollback()
            raise e

def reject_pending_transaction(req_id: int):
    """
    Reject/Cancel a queued transaction request (FIFO remove).
    Reverts the sender's Available Balance.
    """
    # Dequeue/remove from in-memory queue
    req = queue.remove_by_id(req_id)
    
    with connect_db() as conn:
        req_row = conn.execute("SELECT * FROM pending_transactions WHERE id = ? AND status = 'pending'", (req_id,)).fetchone()
        if not req_row:
            raise ValueError("Transaction request not found or already processed.")
            
        req_dict = dict(req_row)
        sender_acc = dictionary.get(req_dict["sender_account_number"])
        amount = req_dict["amount"]
        
        try:
            # Revert Sender's Available Balance
            new_sender_avail = sender_acc["available_balance"] + amount
            conn.execute("UPDATE accounts SET available_balance = ? WHERE account_number = ?", 
                         (new_sender_avail, sender_acc["account_number"]))
            
            # Mark status as rejected
            conn.execute("UPDATE pending_transactions SET status = 'rejected' WHERE id = ?", (req_id,))
            conn.commit()
            
            # Sync Cache
            dictionary.update_balance(sender_acc["account_number"], sender_acc["balance"], new_sender_avail)
            return True
        except Exception as e:
            conn.rollback()
            raise e

def undo_last_transaction() -> dict:
    """
    LIFO Reversal Operation.
    Pops the top completed transaction from TransactionStack and reverses its effects.
    """
    if stack.is_empty():
        raise ValueError("No recent transactions available to undo.")
        
    tx = stack.pop()
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    
    with connect_db() as conn:
        # Verify transaction still exists in DB and is not already undone
        tx_row = conn.execute("SELECT * FROM transactions WHERE id = ? AND is_undone = 0", (tx["id"],)).fetchone()
        if not tx_row:
            raise ValueError("This transaction cannot be undone or has already been reversed.")
            
        tx_data = dict(tx_row)
        amount = abs(tx_data["amount"]) # Treat as positive delta for reversal math
        
        # Reversal logic based on transaction type
        try:
            # Get sender account details (the account that logged this transaction)
            sender_acc_row = conn.execute("SELECT * FROM accounts WHERE id = ?", (tx_data["sender_account_id"],)).fetchone()
            if not sender_acc_row:
                raise ValueError("Source account no longer exists.")
            sender_acc = dict(sender_acc_row)
            
            if tx_data["type"] == "deposit":
                # Reversing deposit: Deduct balance
                new_bal = sender_acc["balance"] - amount
                new_avail = sender_acc["available_balance"] - amount
                
                conn.execute("UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?", 
                             (new_bal, new_avail, sender_acc["id"]))
                dictionary.update_balance(sender_acc["account_number"], new_bal, new_avail)
                
            elif tx_data["type"] == "withdrawal":
                # Reversing withdrawal: Restore balance
                new_bal = sender_acc["balance"] + amount
                new_avail = sender_acc["available_balance"] + amount
                
                conn.execute("UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?", 
                             (new_bal, new_avail, sender_acc["id"]))
                dictionary.update_balance(sender_acc["account_number"], new_bal, new_avail)
                
            elif tx_data["type"] == "transfer":
                # Reversing transfer:
                # Re-credit the sender and debit the receiver
                rec_acc_row = conn.execute("SELECT * FROM accounts WHERE id = ?", (tx_data["recipient_account_id"],)).fetchone()
                if not rec_acc_row:
                    raise ValueError("Recipient account no longer exists.")
                rec_acc = dict(rec_acc_row)
                
                # Check negative or positive amount. If tx amount is negative, the sender was debited.
                # Since we push the DEBIT leg of a transfer to the stack, amount will be negative in database.
                # So sender balance increases, recipient balance decreases.
                new_sender_bal = sender_acc["balance"] + amount
                new_sender_avail = sender_acc["available_balance"] + amount
                new_rec_bal = rec_acc["balance"] - amount
                new_rec_avail = rec_acc["available_balance"] - amount
                
                conn.execute("UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?", 
                             (new_sender_bal, new_sender_avail, sender_acc["id"]))
                conn.execute("UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?", 
                             (new_rec_bal, new_rec_avail, rec_acc["id"]))
                
                # Sync caches
                dictionary.update_balance(sender_acc["account_number"], new_sender_bal, new_sender_avail)
                dictionary.update_balance(rec_acc["account_number"], new_rec_bal, new_rec_avail)
                
            elif tx_data["type"] == "bill":
                # Reversing bill payment: Re-credit checking, toggle bill status back to pending
                new_bal = sender_acc["balance"] + amount
                new_avail = sender_acc["available_balance"] + amount
                
                conn.execute("UPDATE accounts SET balance = ?, available_balance = ? WHERE id = ?", 
                             (new_bal, new_avail, sender_acc["id"]))
                
                # Find bill from note or details
                # Retrieve bill using transaction description / payee
                payee_name = tx_data["title"]
                conn.execute(
                    "UPDATE bills SET status = 'pending' WHERE payee = ? AND amount = ? AND status = 'paid'", 
                    (payee_name, amount)
                )
                dictionary.update_balance(sender_acc["account_number"], new_bal, new_avail)
                
            # Mark the original transaction as undone
            conn.execute("UPDATE transactions SET is_undone = 1 WHERE id = ?", (tx_data["id"],))
            
            # Also find and mark the corresponding credit leg if it was a transfer
            if tx_data["type"] == "transfer":
                conn.execute(
                    "UPDATE transactions SET is_undone = 1 WHERE sender_account_id = ? AND recipient_account_id = ? AND amount = ? AND created_at = ?",
                    (tx_data["recipient_account_id"], tx_data["sender_account_id"], amount, tx_data["created_at"])
                )
                
            # Log the rollback action to transaction logs
            conn.execute(
                "INSERT INTO transactions (sender_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (sender_acc["id"], 0.0, "undo", "undo", "completed", f"Reversed transaction ID {tx_data['id']}", now, "Admin Reversal Log")
            )
            
            conn.commit()
            return {"success": True, "reversed_tx_id": tx_data["id"]}
            
        except Exception as e:
            conn.rollback()
            raise e

def add_new_beneficiary(user_id: int, name: str, account_number: str):
    # Verify account exists in Dictionary lookup cache
    acc = dictionary.get(account_number)
    if not acc:
        raise ValueError("Account number does not exist.")
        
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with connect_db() as conn:
        # Check if already added
        exists = conn.execute("SELECT id FROM beneficiaries WHERE user_id = ? AND account_number = ?", (user_id, account_number)).fetchone()
        if exists:
            raise ValueError("Beneficiary already exists in your list.")
            
        conn.execute(
            "INSERT INTO beneficiaries (user_id, name, account_number, created_at) VALUES (?, ?, ?, ?)",
            (user_id, name, account_number, now)
        )
        conn.commit()

def calculate_savings_zakat(account_number: str) -> dict:
    """
    Calculate estimate Zakat on savings account.
    Nisab threshold for savings is set to 100,000 PKR.
    Zakat rate is 2.5% of balance.
    """
    acc = dictionary.get(account_number)
    if not acc:
        raise ValueError("Account not found.")
    if acc["account_type"] != "savings":
        return {"zakat_due": 0.0, "reason": "Zakat is only calculated on savings balances."}
        
    nisab = 100000.0 # PKR Nisab threshold
    bal = acc["balance"]
    
    if acc["zakat_enabled"] == 0:
        return {"zakat_due": 0.0, "reason": "Zakat is disabled on this account."}
        
    if bal < nisab:
        return {"zakat_due": 0.0, "reason": f"Account balance is below Nisab threshold (PKR {nisab:,.2f})."}
        
    zakat_due = bal * 0.025
    return {"zakat_due": round(zakat_due, 2), "nisab": nisab, "balance": bal}

def deduct_savings_zakat(account_number: str) -> dict:
    """
    Execute Zakat deduction on savings balance.
    Deducts 2.5% if criteria are met.
    """
    calc = calculate_savings_zakat(account_number)
    zakat_due = calc.get("zakat_due", 0.0)
    
    if zakat_due <= 0:
        raise ValueError(calc.get("reason", "No Zakat is due on this account."))
        
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    acc = dictionary.get(account_number)
    
    new_bal = acc["balance"] - zakat_due
    new_avail = acc["available_balance"] - zakat_due
    
    with connect_db() as conn:
        conn.execute(
            "UPDATE accounts SET balance = ?, available_balance = ? WHERE account_number = ?",
            (new_bal, new_avail, account_number)
        )
        # Log Transaction
        cursor = conn.execute(
            "INSERT INTO transactions (sender_account_id, amount, category, type, status, note, created_at, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (acc["id"], -zakat_due, "zakat", "bill", "completed", f"Annual Zakat deduction (2.5%)", now, "Zakat Payment")
        )
        tx_id = cursor.lastrowid
        conn.commit()
        
        # Sync Cache
        dictionary.update_balance(account_number, new_bal, new_avail)
        
        # Push completed action to Stack
        tx_row = conn.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,)).fetchone()
        stack.push(dict(tx_row))
        
        return {"balance": new_bal, "zakat_paid": zakat_due}
