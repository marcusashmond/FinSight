# FinSight

**Live Demo:** [fin-sight-beta-eosin.vercel.app](https://fin-sight-beta-eosin.vercel.app)

A personal finance dashboard for tracking income, expenses, and budgets. Built with React, Node/Express, and MongoDB.

## Features

- **Dashboard** — Monthly income vs expense trends, spending breakdown by category
- **Transactions** — Add, filter by date/category/merchant, and export to CSV
- **Budgets** — Set spending limits per category with live progress tracking
- **Upload** — Import transactions from CSV bank exports
- **Auth** — JWT-based authentication with profile and password management

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, Axios  
**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JWT  
**Tooling:** nodemon, Joi validation, multer (file uploads)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Backend

```bash
cd backend
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`) |
| `PORT` | Server port (default: `3001`) |

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update profile name |
| PATCH | `/api/auth/me/password` | Change password |
| GET | `/api/transactions` | List transactions (filterable) |
| POST | `/api/transactions` | Create transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/budgets` | List budgets |
| POST | `/api/budgets` | Create or update budget |
| DELETE | `/api/budgets/:id` | Delete budget |
| GET | `/api/analytics/summary` | Income/expense summary |
| GET | `/api/analytics/categories` | Spending by category |
| GET | `/api/analytics/trends` | Monthly trends |
| POST | `/api/upload` | Upload CSV bank export |

## Project Structure

```
FinSight/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── app.js
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        └── services/
```

## License

MIT
