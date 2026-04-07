<div align="center">

# 🚨 Disaster Relief Resource Tracker

### *Real-Time Crisis Intelligence & Coordination Platform*

[![Status](https://img.shields.io/badge/Status-Production%20Ready-22c55e?style=for-the-badge)](https://github.com)
[![Stack](https://img.shields.io/badge/Stack-MERN-6366f1?style=for-the-badge)](https://github.com)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **Empowering relief organizations with real-time data, intelligent dispatch, and crisis-grade reliability — built for the moments that matter most.**

</div>

---

## 🌍 The Problem

Every year, natural disasters affect **hundreds of millions of people** worldwide. The difference between life and death often comes down to one question:

> *"Do we have the right resources, in the right place, at the right time?"*

Relief organizations face critical operational failures during crises:

| Challenge | Impact |
|-----------|--------|
| 📦 No real-time inventory visibility | Resources run out without warning |
| 👥 Manual volunteer coordination | Delays in deploying trained personnel |
| 🗺️ No geographic situational awareness | Aid misrouted to wrong zones |
| 📊 Fragmented data across teams | Coordinators make decisions blind |
| ⚠️ No automated alerting | Critical shortages discovered too late |

---

## 💡 The Solution

**Disaster Relief Resource Tracker** is a production-grade, full-stack web platform that gives relief organizations a **unified command center** — from inventory tracking to volunteer dispatch to live crisis mapping.

Built to operate under extreme conditions: unreliable networks, high concurrency, and zero tolerance for data loss.

---

## 🚀 Key Features

### 📦 Inventory Management
- Real-time stock tracking across all relief centers
- Automatic **critical alerts** when items fall below minimum thresholds
- **Bulk update** system with manual rollback safety (M0 Atlas compatible)
- Category filtering: food, medicine, shelter, water, equipment
- CSV export for offline reporting

### 👥 Volunteer Coordination
- Full volunteer registry with skill tags
- Availability status management (available / busy / offline)
- **Double-assignment prevention** — system blocks reassigning busy volunteers
- One-click task assignment with center selection

### 🚚 Dispatch Management
- Create and track dispatch tasks with **4-level priority system** (low → critical)
- Real-time status tracking: pending → assigned → completed
- Automatic volunteer release when task is completed
- Filterable dispatch log with CSV export

### 🗺️ Crisis Map & Heatmap
- Interactive **Leaflet map** showing all relief center locations
- Red markers + zone circles for overloaded/critical centers
- Heatmap overlay showing active dispatch intensity per zone
- Live legend with center status indicators

### 📊 Analytics Dashboard
- Overview cards: total centers, available volunteers, active alerts
- **Dispatch status bar chart** and **center status pie chart**
- Critical inventory panel with per-center breakdown
- Overloaded centers table with capacity progress bars
- Refresh-on-demand analytics

### 🔐 Role-Based Access Control
| Role | Capabilities |
|------|-------------|
| **Admin** | Full access — create, edit, delete everything |
| **Coordinator** | Manage centers, inventory, volunteers, dispatch |
| **Volunteer** | View-only access to all data |

### 🌙 Dark / Light Mode
- System preference detection on first load
- Persistent toggle stored in localStorage
- Full dark mode across all pages and components

---

## 🧠 Unique Innovations

### ⚡ Failure-Safe Backend (No Transaction Dependency)
MongoDB Atlas M0 (free tier) does not support transactions. Instead of failing, the system implements a **sequential write pattern with manual rollback** — each bulk operation tracks inserted documents and reverses them on failure, providing ACID-like safety without replica set requirements.

### 🌱 Intelligent Auto-Seeding
On first startup in development, the system automatically seeds realistic data (centers, inventory, volunteers, dispatches) with a **duplicate guard** — subsequent restarts skip seeding entirely. Zero manual setup required.

### 🔒 JWT Interceptor with Smart 401 Handling
The Axios interceptor distinguishes between auth endpoint failures (wrong password → show error) and session expiry (expired token → auto-logout). Login failures never trigger a redirect loop.

### 🗺️ GeoJSON-Native Location Storage
Relief center locations are stored in both **GeoJSON format** (for MongoDB 2dsphere geospatial queries) and flat lat/lng fields (for frontend rendering) — enabling future proximity-based volunteer dispatch.

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite 6 | UI framework + build tool |
| **Styling** | Tailwind CSS 3 | Utility-first design system |
| **Animations** | Framer Motion | Page transitions + micro-interactions |
| **Charts** | Recharts | Dashboard analytics visualization |
| **Maps** | React Leaflet + Leaflet.js | Interactive crisis mapping |
| **State** | React Context API | Auth + theme global state |
| **HTTP** | Axios | API client with interceptors |
| **Backend** | Node.js + Express | REST API server |
| **Database** | MongoDB Atlas + Mongoose | Cloud document database |
| **Auth** | JWT + bcryptjs | Stateless authentication |
| **Security** | Helmet + express-rate-limit | HTTP hardening + abuse prevention |
| **Validation** | Joi | Request body schema validation |
| **Deployment** | Vercel | Serverless hosting (frontend + backend) |

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Vercel)                     │
│  React + Vite │ Tailwind │ Recharts │ Leaflet            │
│  Context API (Auth + Theme) │ Axios + JWT Interceptor    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS (VITE_API_URL)
┌────────────────────────▼────────────────────────────────┐
│                    SERVER (Vercel)                        │
│  Express.js │ Helmet │ CORS │ Rate Limiter               │
│  JWT Auth Middleware │ Joi Validation │ Async Handler     │
│  Controllers: Auth │ Centers │ Inventory │ Volunteers     │
│              Dispatch │ Analytics                         │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────┐
│               MongoDB Atlas (M0 Free Tier)               │
│  Collections: users │ reliefcenters │ inventory          │
│               volunteers │ dispatches │ logs             │
│  Indexes: 2dsphere (location) │ email │ centerId         │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Demo Credentials

> Seeded automatically on first server startup in development.

| Role | Email | Password |
|------|-------|----------|
| 🔴 **Admin** | `admin@relief.org` | `password123` |
| 🔵 **Coordinator** | `sara@relief.org` | `password123` |
| 🟢 **Volunteer** | `james@relief.org` | `password123` |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+ (v22 recommended)
- MongoDB Atlas account (free M0 tier works)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/disaster-relief-tracker.git
cd disaster-relief-tracker
```

### 2. Setup the server
```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/disaster
PORT=5000
NODE_ENV=development
JWT_SECRET=<your_random_32_char_secret>
CLIENT_URL=http://localhost:5173
ENABLE_SEED=false
```

```bash
npm run dev
# Server starts on http://localhost:5000
# MongoDB connects and seeds data automatically on first run
```

### 3. Setup the client
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
# App starts on http://localhost:5173
```

---

## 🚀 Vercel Deployment

### Deploy the Backend

1. Push the `server/` folder to a GitHub repository
2. Create a new Vercel project → import the repo → set **Root Directory** to `server`
3. Add environment variables in Vercel dashboard:

```
MONGO_URI        = <your Atlas connection string>
JWT_SECRET       = <your secret>
CLIENT_URL       = https://your-frontend.vercel.app
NODE_ENV         = production
```

4. Deploy — Vercel auto-detects `@vercel/node` from `vercel.json`

### Deploy the Frontend

1. Create a new Vercel project → import the same repo → set **Root Directory** to `client`
2. Add environment variable:

```
VITE_API_URL = https://your-backend.vercel.app/api
```

3. Deploy — Vercel auto-detects Vite and runs `npm run build`

> **SPA routing** is handled by `client/vercel.json` which rewrites all paths to `index.html`.

---

## 🔒 Security Features

- **Password Hashing** — bcrypt with 12 salt rounds
- **JWT Authentication** — 7-day expiry, signed with secret
- **Role-Based Access Control** — route-level and UI-level enforcement
- **HTTP Security Headers** — Helmet middleware (XSS, HSTS, CSP)
- **Rate Limiting** — 100 requests per 15 minutes per IP on all `/api` routes
- **Input Validation** — Joi schemas on every POST/PUT endpoint
- **Environment Isolation** — no backend secrets ever reach the frontend
- **CORS Whitelist** — only configured origins accepted

---

## 🧩 Edge Case Handling

| Scenario | Handling |
|----------|----------|
| Duplicate user registration | 409 response before insert |
| Negative inventory quantity | Joi `min(0)` + Mongoose validator |
| Over-capacity relief center | Guard in controller + auto-status update |
| Volunteer double-assignment | `availability === "busy"` check → 409 |
| Bulk update partial failure | Sequential writes + manual rollback |
| Expired JWT token | Clear error message + auto-redirect |
| Invalid MongoDB ObjectId | CastError caught → 400 response |
| Empty database | All pages show empty states gracefully |
| API timeout / network failure | Axios timeout + toast error messages |
| Duplicate seed inserts | `countDocuments()` guard — skips if data exists |

---

## 📈 Future Enhancements

- 🤖 **AI Disaster Prediction** — ML model to forecast resource demand based on disaster type and scale
- 📱 **SMS Alerts** — Twilio integration for critical inventory and dispatch notifications
- 🔄 **Real-Time Updates** — WebSocket / Socket.io for live dashboard without page refresh
- 🚁 **Drone Integration** — API hooks for autonomous supply delivery tracking
- 📍 **Volunteer GPS Tracking** — Live location updates on the crisis map
- 🌐 **Multi-Language Support** — i18n for global deployment
- 📊 **Advanced Reporting** — PDF report generation for post-disaster analysis
- 🔔 **Push Notifications** — Browser notifications for critical alerts

---

## 🤝 Contributing

Contributions are welcome and appreciated.

```bash
# Fork the repository
# Create your feature branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "feat: add your feature description"

# Push to the branch
git push origin feature/your-feature-name

# Open a Pull Request
```

Please ensure:
- Code follows existing patterns and style
- No new dependencies without discussion
- All existing features remain functional

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with purpose. Deployed with precision. Ready for the real world.**

*Disaster Relief Resource Tracker — because every second counts.*

</div>
