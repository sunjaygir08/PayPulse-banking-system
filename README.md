# PayPulse Banking System

PayPulse is a professional digital banking platform built with a **React + Vite** frontend and a **Python Flask** backend. It demonstrates key Data Structures & Algorithms (DSA) concepts in an academic context while presenting a premium enterprise-grade visual aesthetic.

> **Single entry point:** `http://localhost:5000` — Flask serves both the REST API and the built React SPA from the same port.

---

## 🚀 Quick Start

### Windows
```powershell
.\run.bat
```

### Linux / macOS
```bash
chmod +x run.sh
./run.sh
```

Both scripts automatically:
1. Detect Python and create / reuse a `.venv` virtual environment
2. Install backend Python dependencies from `requirements.txt`
3. Install frontend npm packages (only on first run)
4. **Build the React app** (`npm run build` → `frontend/dist/`)
5. Launch Flask at **http://localhost:5000** and open your browser

---

## 🛠️ Manual Setup

### Prerequisites
- Python 3.9+
- Node.js 18+ & NPM

### Backend
```bash
# From the project root
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux / macOS
pip install -r backend/requirements.txt
```

### Frontend
```bash
cd frontend
npm install
npm run build          # Compiles React → frontend/dist/  (served by Flask)
```

### Run the Application
```bash
# From the project root (with .venv activated)
python -m backend.main
# → http://localhost:5000
```

### Development Mode (Hot-Reload)
Run both services in parallel for instant frontend hot-reload:

```bash
# Terminal 1 – Flask API
python -m backend.main

# Terminal 2 – Vite dev server (proxies /api → localhost:5000)
cd frontend
npm run dev
# → http://localhost:5173  (all API calls forwarded to Flask automatically)
```

---

## 🧠 DSA Implementation

| Structure | Class | Usage |
|---|---|---|
| **Stack (LIFO)** | `TransactionStack` in `backend/models/dsa.py` | Last 100 transactions are pushed onto the stack. Admin "Undo" pops the top and rolls back its financial effect. |
| **Queue (FIFO)** | `PendingTransactionQueue` in `backend/models/dsa.py` | "Standard" transfers are enqueued. Available balance is reserved until an admin approves the item in FIFO order. |
| **Dictionary** | `AccountDictionary` in `backend/models/dsa.py` | `account_number → account_data` O(1) in-memory cache, populated on boot and kept in sync on every transaction. |
| **QuickSort** | `quicksort_transactions` in `backend/models/dsa.py` | Transaction histories are sorted in-memory using a custom QuickSort before being returned to the client. |

---

## 🎨 UI Features

- **Corporate Light** theme by default (Dark mode toggle available)
- Recharts-powered spend analytics and monthly summary charts
- 2D virtual debit card widget with freeze/unfreeze toggle
- Searchable & sortable transaction ledger
- Zakat calculator (savings accounts only — 2.5% at ≥ PKR 100,000 Nisab)
- Admin Panel: Queue Manager, Undo Stack, Dictionary User Lookup, System Logs
- Beneficiary manager with add/delete
- Responsive: desktop sidebar + mobile bottom navigation bar
- CNIC & mobile number format validation (Pakistani format)
- PKR currency formatting throughout

---

## 📂 Project Structure

```
PayPulse/
├── run.bat                    # Windows one-click setup & launcher
├── run.sh                     # Linux / macOS one-click setup & launcher
├── README.md
├── banking.db                 # SQLite database (auto-created on first run)
├── backend/
│   ├── main.py                # Flask app factory, static serving, port 5000
│   ├── requirements.txt
│   ├── database/
│   │   └── db.py              # SQLite schema, tables & admin seed
│   ├── models/
│   │   └── dsa.py             # Stack, Queue, Dictionary & QuickSort
│   ├── routes/
│   │   ├── auth_routes.py     # /api/auth/* — Login, Signup, CNIC validation
│   │   ├── banking_routes.py  # /api/* — Transfers, Bills, Zakat, Cards
│   │   └── admin_routes.py    # /api/admin/* — Freeze, Queue, Undo
│   ├── services/
│   │   └── banking_service.py # Core transaction mechanics & DSA drivers
│   └── utils/
│       └── helpers.py         # Card generation, CNIC/mobile regex helpers
└── frontend/
    ├── package.json
    ├── vite.config.js          # Build → dist/, dev proxy → localhost:5000
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx             # Routing, session restore, toast system
        ├── index.css           # Corporate design system & CSS variables
        └── components/
            ├── Sidebar.jsx         # Fixed nav + mobile bottom bar
            ├── common/             # 15 reusable UI primitives
            ├── dashboard/          # 8 modular dashboard widgets
            ├── admin/              # 5 admin DSA control widgets
            ├── bills/              # Bill card & add-bill form
            ├── transfer/           # Transfer form, beneficiaries, success screen
            ├── settings/           # Profile, security & picture uploader
            └── pages/              # 8 page entry points (imported by App.jsx)
                ├── LandingPage.jsx
                ├── LoginSignup.jsx
                ├── Dashboard.jsx
                ├── Transfer.jsx
                ├── BillPay.jsx
                ├── VirtualCards.jsx
                ├── ProfileSettings.jsx
                └── AdminPanel.jsx
```

---

## 🛡️ Sandbox Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@paypulse.pk` | `admin123` |
| **User** | Register any new account | — |

- New users are automatically seeded with a Checking account (PKR 5,000) and a Savings account (PKR 10,000).
- Use the Admin account to test the Queue processor, Undo Stack, and account freeze controls.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PAYPULSE_HOST` | `127.0.0.1` | Host interface for Flask |
| `PAYPULSE_PORT` | `5000` | Port for Flask (and the app entry point) |

```bash
# Example: bind to all interfaces for LAN access
PAYPULSE_HOST=0.0.0.0 python -m backend.main
```
