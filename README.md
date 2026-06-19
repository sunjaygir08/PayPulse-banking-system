# PayPulse Banking System

A modern, full-stack banking application with a React frontend and Python Flask backend. Built for managing accounts, transfers, bill payments, and virtual cards.

**Version:** 1.0.0 | **License:** MIT

## Overview

PayPulse is a comprehensive banking system starter project that provides a complete foundation for banking operations. It features a responsive React interface with authentication, account management, and transaction capabilities, backed by a robust Flask API with SQLite database.

## Features

- **User Authentication** - Secure login/signup with email and password
- **Dashboard** - Real-time account overview and transaction history
- **Money Transfers** - Send money between accounts
- **Bill Payments** - Pay bills easily with saved payees
- **Virtual Cards** - Create and manage virtual payment cards
- **Profile Settings** - Manage user profile and security settings
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Modern UI** - Clean, polished interface with Lucide icons

## Technology Stack

**Backend:**
- Python 3.x
- Flask - Web framework
- SQLite - Database
- JSON API architecture

**Frontend:**
- React 19 - UI framework
- Vite - Build tool and dev server
- Lucide React - Icon library
- CSS3 - Styling and responsive design

## Project Structure

```
Banking System Website/
├── README.md                  # Project documentation
├── run.bat                    # Startup script
├── backend/                   # Flask backend
│   ├── main.py               # Flask application & API routes
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React frontend
│   ├── package.json          # NPM dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── eslint.config.js      # ESLint configuration
│   ├── index.html            # HTML entry point
│   ├── public/               # Static assets
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Main app component
│       ├── index.css         # Global styles
│       └── components/       # React components
│           ├── Dashboard.jsx
│           ├── Transfer.jsx
│           ├── BillPay.jsx
│           ├── VirtualCards.jsx
│           ├── LoginSignup.jsx
│           ├── ProfileSettings.jsx
│           ├── LandingPage.jsx
│           └── Sidebar.jsx
└── banking.db               # SQLite database (created at runtime)
```

## Installation & Setup

### Prerequisites

- Python 3.x
- Node.js and npm

### Quick Start (Automated)

Run the startup script:
```bash
./run.bat
```

### Manual Installation

**Option 1: Start both backend and frontend separately**

Backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

Frontend (in another terminal):
```bash
cd frontend
npm install
npm run dev
```

**Option 2: Using the run.bat script**

Simply execute `,/run.bat` which handles the setup and starts both services.

## Access

- **Frontend:** http://localhost:5000 (or http://localhost:3000 if running Vite dev server separately)
- **API Endpoint:** http://localhost:5000/api/* (or configured port)

## Database

The application uses SQLite with the following tables:
- **users** - User accounts and authentication
- **accounts** - Bank accounts (checking, savings, credit)
- **transactions** - Transaction history
- Additional tables for cards, bill payments, and transfers

The database file (`banking.db`) is created automatically on first run.

## Available Scripts

**Backend:**
- `python main.py` - Start the Flask server

**Frontend:**
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Environment Variables

Configure these optional environment variables:

**Backend:**
- `PAYPULSE_DB_PATH` - Custom database path (default: `./banking.db`)
- `PAYPULSE_HOST` - Server host (default: `127.0.0.1`)
- `PAYPULSE_PORT` - Server port (default: `5000`)

## License

MIT
- backend/
   - main.py (Python server and API)
- frontend/
   - index.html (single page layout)
   - app.js (frontend logic)
   - style.css (styling)

API ENDPOINTS

GET /api/health - Health check
GET /api/summary - Current balance and recent activity
GET /api/activities - Recent activity entries
POST /api/activities - Add a new activity entry

GETTING STARTED

1. Open the site in your browser.
2. Add a few activities to see the live ledger update.
3. Use the page as a base for accounts, transfers, and auth later.

DATABASE

Activities table: id, title, category, amount, note, created_at

TROUBLESHOOTING

Port 5000 already in use:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

Browser does not open:
Run `http://localhost:5000` manually after starting `backend/main.py`.

NOTES

Database file: banking.db (created automatically)
Data is stored locally on your machine
You can replace the demo ledger with future banking features later
