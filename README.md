# PayPulse Banking System

PayPulse is a professional digital banking platform built with a high-fidelity React + Vite frontend and a Python Flask backend. It is designed to demonstrate key Data Structures and Algorithms (DSA) concepts in an academic context while presenting a premium, glassmorphic visual aesthetic.

---

## 🚀 Core DSA Implementation

The system utilizes custom-implemented Python data structures in the backend to manage core banking flows. These structures are synchronized with the SQLite database on startup:

### 1. Stack (LIFO) → Transaction Reversals
* **Class**: `TransactionStack` in [dsa.py](file:///c:/Users/sanja/OneDrive/Documents/Github/Banking%20System%20Website/backend/models/dsa.py)
* **Usage**: The last 100 successful transactions are loaded into an in-memory stack. If a system administrator triggers an "Undo Last Action" in the Admin Panel, the top transaction is popped and its financial effects (debits/credits) are rolled back in the database and caches.

### 2. Queue (FIFO) → Transaction Approval Pipeline
* **Class**: `PendingTransactionQueue` in [dsa.py](file:///c:/Users/sanja/OneDrive/Documents/Github/Banking%20System%20Website/backend/models/dsa.py)
* **Usage**: When a user makes a transfer choosing "Standard Processing (Queued)", the transaction request is enqueued. Available balance is reserved, but the current balance remains unchanged until an administrator approves and processes the queue item in first-in, first-out order.

### 3. Dictionary → Fast Account Lookup
* **Class**: `AccountDictionary` in [dsa.py](file:///c:/Users/sanja/OneDrive/Documents/Github/Banking%20System%20Website/backend/models/dsa.py)
* **Usage**: Maps `account_number -> account_data` for O(1) in-memory lookups. This cache is automatically populated on server boot and is updated in real-time on every transaction, reducing repetitive database queries on hot paths.

### 4. Custom List Sorting → QuickSort for Logs
* **Function**: `quicksort_transactions` in [dsa.py](file:///c:/Users/sanja/OneDrive/Documents/Github/Banking%20System%20Website/backend/models/dsa.py)
* **Usage**: Transaction histories are stored in standard Python lists. Before sending transaction logs to the client, the backend sorts them in-memory using a custom QuickSort implementation supporting multiple keys (e.g., date, amount) and sort orders.

---

## 🎨 UI & UX Features

* **Glassmorphic Theme**: Dark Obsidian theme (default) and Alpine Light theme styled with custom CSS variables, gradients, and backdrop blur.
* **3D Virtual Cards**: Fully interactive CSS-transformed debit cards that flip dynamically to reveal CVV and card numbers, with a freeze toggle that frosts the card face and limit sliders.
* **Responsive Layouts**: Collapsible sidebar navigation for desktop screens and a floating mobile navigation bar for touchscreens.
* **Avatar Customization**: Real-time avatar selection and settings panel.
* **Interactive Dashboard**: Quick-transfer tools, real-time Zakat calculations with toggle controls, and spent-category meters.

---

## 📂 Project Structure

```
PayPulse/
├── README.md                  # Project documentation
├── run.bat                    # Setup and execution runner script
├── backend/                   # Python Flask API & DSA backend
│   ├── main.py               # Application entry point & static serving
│   ├── requirements.txt       # Python package requirements
│   ├── database/
│   │   └── db.py              # SQLite schema, tables & admin seed
│   ├── models/
│   │   └── dsa.py             # Stack, Queue, Dictionary & QuickSort
│   ├── routes/
│   │   ├── auth_routes.py     # Login, Signup (CNIC/Mobile validation)
│   │   ├── banking_routes.py  # User actions, deposits, zakat toggles
│   │   └── admin_routes.py    # Admin actions, freeze, queue, undo
│   ├── services/
│   │   └── banking_service.py # Core transaction mechanics & stack/queue drivers
│   └── utils/
│       └── helpers.py         # Card generation, CNIC & Mobile regex format checks
└── frontend/                  # React Single Page App
    ├── package.json           # Frontend packages
    ├── vite.config.js         # Proxy configurations for /api
    ├── index.html             # HTML mounting index
    └── src/
        ├── main.jsx           # React app mount
        ├── App.jsx            # Routing and toast controls
        ├── index.css          # Styling system & glassmorphism variables
        └── components/        # Modulized UI sections
            ├── Dashboard.jsx  # Overview, spend meters, filterable lists
            ├── Transfer.jsx   # Standard vs Express transfers & beneficiaries
            ├── BillPay.jsx    # Utilities invoicing
            ├── VirtualCards.jsx # 3D flip card graphic, limit control
            ├── ProfileSettings.jsx # User security & profile
            ├── AdminPanel.jsx # Queue process, Stack undo, Account freeze controls
            ├── Sidebar.jsx    # Fluid side nav
            └── LandingPage.jsx# Interactive bank value showcase
```

---

## 🛠️ Installation & Execution

### Prerequisites
* **Python 3.x**
* **Node.js & NPM**

### The Quick Start Runner (Windows)
1. Clone or copy the project into a folder.
2. Double-click the [run.bat](file:///c:/Users/sanja/OneDrive/Documents/Github/Banking%20System%20Website/run.bat) file or execute it in your VS Code terminal:
   ```powershell
   .\run.bat
   ```
   *This script automatically configures the Python virtual environment (`.venv`), installs dependencies, installs frontend packages, compiles the React assets, launches the local server, and launches your browser at `http://localhost:5000`.*

### Manual Installation (Cross-Platform)

#### 1. Setup Backend
```bash
# Navigate to the root directory
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
python -m backend.main
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run build   # Build dist folder served by Flask
# OR for live reloading frontend:
npm run dev     # Starts dev server on port 5173
```

---

## 🛡️ Sandbox Credentials
* **User Accounts**: Register any user account to test Checking (PKR 5,000 pre-seeded), Savings (PKR 10,000 pre-seeded), and Credit cards.
* **Pre-Seeded Administrator Account**:
  * **Email**: `admin@paypulse.pk`
  * **Password**: `admin123`
  * *Use this account to access the Admin Dashboard to test transaction undos (Stack), pending requests processing (Queue), and lock/unlock client accounts.*
