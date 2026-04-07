# Disaster Relief Resource Tracker

A production-grade MERN application for coordinating disaster relief resources.

## Project Structure

```
root/
├── client/        React + Vite frontend
├── server/        Express API (Vercel serverless)
├── .gitignore
└── README.md
```

## Setup

### Server
```bash
cd server
npm install
# Fill in server/.env → MONGO_URI and PORT
npm run dev
```

### Client
```bash
cd client
npm install
# Fill in client/.env → VITE_API_URL
npm run dev
```

## Environment Variables

**server/.env**
```
MONGO_URI=<your_mongodb_connection_string>
PORT=5000
NODE_ENV=development
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
```

## Deployment (Vercel)

- Deploy `server/` as a separate Vercel project (Node.js)
- Deploy `client/` as a separate Vercel project (Vite)
- Set environment variables in each Vercel project dashboard
- Update `VITE_API_URL` in client to point to deployed server URL

## API Endpoints (Phase 1)

| Method | Route | Description        |
|--------|-------|--------------------|
| GET    | /     | Health check       |
| GET    | /api  | API version info   |
