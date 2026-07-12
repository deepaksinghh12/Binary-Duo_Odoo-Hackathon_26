# EcoSphere: ESG Management & ERP Integration Platform

EcoSphere is a unified Environmental, Social, and Governance (ESG) Management platform designed to integrate sustainability metrics, CSR tracking, compliance, governance policies, and gamified challenges directly into day-to-day corporate operations.

## Team Details
- **Team Name**: Binary Duo
- **Members**:
  - **Deepak** *(Team Leader/Backend Developer)*
  - **Akshat Sharma** *(Frontend Developer)*

---

## Folder Structure

```text
Binary-Duo_Odoo-Hackathon_26/
├── backend/                  # Express & TypeScript Backend
│   ├── src/
│   │   ├── config/           # Database, Redis, Swagger, & Env Configurations
│   │   ├── database/         # Knex Migrations & Master Seed files
│   │   ├── features/         # Feature modules (auth, dashboard, emissions, social, governance, settings, etc.)
│   │   ├── jobs/             # BullMQ Background Job Queue processors
│   │   ├── middleware/       # Auth, rate-limiter, caching, and upload middlewares
│   │   └── shared/           # Types and Shared Utilities
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Vite & React Frontend
│   ├── src/
│   │   ├── components/       # Common layouts, sidebars, charts, and navbars
│   │   ├── features/         # Unified Feature pages & layouts (Environmental, Social, Governance, Settings, Gamification)
│   │   ├── services/         # Axios base client & Dashboard services
│   │   ├── App.tsx           # Router mappings & unified routes config
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md                 # Project Documentation
```

---

## Project Setup Guidelines

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Redis Server (for caching and BullMQ background jobs)

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory based on the following config:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=ecosphere_db
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   REDIS_URL=redis://localhost:6379
   FRONTEND_ORIGIN=http://localhost:5173
   ```
4. Run Database Migrations:
   ```bash
   npm run migrate
   ```
5. Seed Database with mock data:
   ```bash
   npm run seed
   ```
6. Start Dev Server:
   ```bash
   npm run dev
   ```

### Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173` to explore the app.

---

## Core Technologies
- **Frontend**: React, TypeScript, TailwindCSS/Vanilla CSS, Vite, Recharts, React Icons
- **Backend**: Node.js, Express, TypeScript, Knex Query Builder, PostgreSQL
- **Caching**: Redis Cache Middleware
- **Background Jobs**: BullMQ (Redis-backed queue processor)
- **API Documentation**: Swagger UI Express
- **File Uploads**: Multer
