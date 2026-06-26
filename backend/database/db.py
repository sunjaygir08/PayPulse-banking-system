import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = Path(os.environ.get("PAYPULSE_DB_PATH", BASE_DIR / "banking.db"))

def connect_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # Make sure parent dir exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    with connect_db() as conn:
        # 1. Users Table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                avatar_url TEXT,
                security_pin TEXT NOT NULL,
                cnic TEXT,
                mobile TEXT,
                is_admin INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            )
        """)
        
        # 2. Accounts Table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                account_type TEXT NOT NULL, -- checking, savings, credit
                account_number TEXT UNIQUE NOT NULL,
                routing_number TEXT NOT NULL,
                balance REAL NOT NULL,
                available_balance REAL NOT NULL,
                status TEXT DEFAULT 'active', -- active, frozen
                customer_id TEXT NOT NULL,
                debit_card_number TEXT NOT NULL,
                zakat_enabled INTEGER DEFAULT 1, -- 1=enabled, 0=disabled
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        # 3. Transactions Table
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
                is_undone INTEGER DEFAULT 0, -- 1 = this transaction has been rolled back by admin
                FOREIGN KEY (sender_account_id) REFERENCES accounts(id)
            )
        """)
        
        # 4. Bills Table
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
        
        # 5. Virtual Cards Table
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
        
        # 6. Beneficiaries Table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS beneficiaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                account_number TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # 7. Pending Transactions Table (Queue Persistence)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS pending_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_account_number TEXT NOT NULL,
                recipient_account_number TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                type TEXT NOT NULL,
                note TEXT,
                status TEXT DEFAULT 'pending', -- pending, processed, rejected
                created_at TEXT NOT NULL
            )
        """)
        
        # Migration: Check and add new columns to existing databases if needed
        # (This handles databases created by older runs gracefully)
        try:
            conn.execute("ALTER TABLE users ADD COLUMN cnic TEXT")
        except sqlite3.OperationalError:
            pass # already exists
        
        try:
            conn.execute("ALTER TABLE users ADD COLUMN mobile TEXT")
        except sqlite3.OperationalError:
            pass
            
        try:
            conn.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0")
        except sqlite3.OperationalError:
            pass

        try:
            conn.execute("ALTER TABLE accounts ADD COLUMN available_balance REAL")
            # Set default values for pre-existing accounts
            conn.execute("UPDATE accounts SET available_balance = balance WHERE available_balance IS NULL")
        except sqlite3.OperationalError:
            pass

        try:
            conn.execute("ALTER TABLE accounts ADD COLUMN status TEXT DEFAULT 'active'")
        except sqlite3.OperationalError:
            pass

        try:
            conn.execute("ALTER TABLE accounts ADD COLUMN customer_id TEXT")
        except sqlite3.OperationalError:
            pass

        try:
            conn.execute("ALTER TABLE accounts ADD COLUMN debit_card_number TEXT")
        except sqlite3.OperationalError:
            pass

        try:
            conn.execute("ALTER TABLE accounts ADD COLUMN zakat_enabled INTEGER DEFAULT 1")
        except sqlite3.OperationalError:
            pass

        try:
            conn.execute("ALTER TABLE transactions ADD COLUMN is_undone INTEGER DEFAULT 0")
        except sqlite3.OperationalError:
            pass

        # Seed default Admin Account if not exists
        admin_email = "admin@paypulse.pk"
        admin_exists = conn.execute("SELECT id FROM users WHERE email = ?", (admin_email,)).fetchone()
        if not admin_exists:
            import hashlib
            admin_pwd = hashlib.sha256("admin123".encode("utf-8")).hexdigest()
            admin_pin = hashlib.sha256("1234".encode("utf-8")).hexdigest()
            now = "2026-06-26T00:00:00"
            conn.execute(
                "INSERT INTO users (email, password_hash, full_name, avatar_url, security_pin, cnic, mobile, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (admin_email, admin_pwd, "System Administrator", "", admin_pin, "00000-0000000-0", "0300-1234567", 1, now)
            )
            
        conn.commit()
