# 🎬 CineBook — Movie Ticket Booking System

A full-stack **MERN** (MongoDB · Express · React · Node.js) movie ticket booking application.  
Users can browse movies, view showtimes, select seats, and complete a demo booking end-to-end.

---

## ✨ Features

| Area | Details |
|------|---------|
| 🎥 **Movies** | Browse now-showing & coming-soon movies with posters, ratings, genres |
| 🕑 **Showtimes** | View showtimes per movie grouped by theatre & screen |
| 💺 **Seat Selection** | Interactive seat map — Regular / Premium / Recliner / Accessible categories |
| 🛒 **Checkout** | Order summary with server-calculated pricing and convenience fee |
| 🔐 **Auth** | JWT-based register / login / logout with protected routes |
| 📋 **My Bookings** | View all personal bookings with status, booking ID, and seat labels |
| ⚡ **Seat Hold** | 5-minute optimistic seat hold prevents double-booking during checkout |
| 🔒 **Concurrency Safety** | Atomic seat reservation; duplicate-booking prevention via DB unique index |
| 🛡️ **Admin Panel** | Admin-only dashboard for managing movies and bookings |
| 🌐 **CORS / Rate Limiting** | Express middleware guards the API |

---

## 🗂️ Project Structure

```
CineBook/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/      # Route handlers (auth, movie, booking, …)
│   │   ├── middleware/        # Auth (JWT), error handler, rate limiter
│   │   ├── models/           # Mongoose schemas (User, Movie, Showtime, Booking, …)
│   │   ├── routes/           # Express routers
│   │   ├── utils/            # Helpers (currency, pagination)
│   │   └── config/           # DB connection, env validation
│   ├── scripts/
│   │   ├── seed.js           # Seeds movies, theatres, screens, showtimes
│   │   └── update-posters.js # Fixes poster URLs in MongoDB
│   ├── server.js             # Entry point
│   ├── .env.example          # Environment variable template
│   └── package.json
│
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── api/              # Axios instance + API service functions
│   │   ├── components/       # Reusable UI (Navbar, SeatMap, Button, Toast, …)
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── layouts/          # AppLayout
│   │   ├── pages/            # HomePage, MoviesPage, MovieDetailPage,
│   │   │                     #   SeatSelectionPage, CheckoutPage,
│   │   │                     #   MyBookingsPage, LoginPage, RegisterPage, …
│   │   ├── utils/            # formatters (INR, date, poster URL helpers)
│   │   └── styles/           # design-system.css
│   ├── vite.config.js        # Vite + proxy to backend
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🛠️ Technologies

**Backend**  
- Node.js 18+ · Express 4  
- MongoDB Atlas · Mongoose 8  
- JSON Web Tokens (jsonwebtoken) · bcryptjs  
- express-rate-limit · cors · dotenv

**Frontend**  
- React 18 · React Router v6  
- Vite 5 · Axios  
- lucide-react (icons)  
- CSS custom properties (design system)

---

## ⚙️ Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- A **MongoDB Atlas** cluster (free tier works) — or a local MongoDB instance
- Git

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Prathimakanuri/FSD-2.git
cd FSD-2
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in your values:

```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cinebook?retryWrites=true&w=majority

# JWT — use a long random string (min 32 chars)
JWT_SECRET=your_long_random_jwt_secret_here
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# TMDB (optional — seeded poster URLs are used if unset)
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

# Admin bootstrap credentials
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@cinebook.com
ADMIN_PASSWORD=StrongPassword123!
```

Install dependencies and seed the database:

```bash
npm install
node scripts/seed.js        # Seeds movies, theatres, screens, showtimes
```

Start the backend server:

```bash
npm run dev       # development (nodemon)
# or
node server.js    # production-style
```

Backend runs at **http://localhost:5000**  
Health check: http://localhost:5000/api/health

---

### 3. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_APP_NAME=CineBook
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

> The Vite dev server proxies `/api/*` requests to `http://localhost:5000` automatically — no need to set `VITE_API_URL` for local development.

Install dependencies and start:

```bash
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## 🔑 Key API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Server health check |
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/movies` | — | List movies (paginated) |
| GET | `/api/movies/:id` | — | Movie detail |
| GET | `/api/showtimes?movieId=` | — | Showtimes for a movie |
| GET | `/api/showtimes/:id/seats` | optional | Seat availability map |
| POST | `/api/bookings/hold` | ✅ JWT | Hold selected seats (5 min) |
| POST | `/api/bookings/confirm` | ✅ JWT | Confirm booking & save |
| GET | `/api/bookings/my` | ✅ JWT | Current user's bookings |
| POST | `/api/bookings/:id/cancel` | ✅ JWT | Cancel a booking |

---

## 🧪 Testing the Booking Flow

1. Open **http://localhost:5173** in your browser
2. Register an account or log in
3. Click any movie → click **Choose Seats** on a showtime
4. Click seat squares to select them → **Proceed to Checkout**
5. Review the order summary (⚠️ Demo Mode — no real payment)
6. Click **Confirm Booking** → see the confirmation with a booking ID
7. Click **View My Bookings** to verify the booking is saved in MongoDB

---

## 🛡️ Security Notes

- All `.env` files are excluded from version control via `.gitignore`
- Passwords are hashed with **bcryptjs** before storage
- JWT tokens are verified on every protected route
- Seat holds use a unique MongoDB index to prevent race-condition double-bookings
- Server-side price calculation — the client price is never trusted

---

## 📸 Movie Data

Movie posters are sourced from [The Movie Database (TMDB)](https://www.themoviedb.org/).  
This product uses the TMDB API but is not endorsed or certified by TMDB.

---

## 📄 License

MIT
