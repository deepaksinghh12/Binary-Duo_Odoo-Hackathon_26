# EcoSphere ESG Platform 🌍

EcoSphere is a real-time ESG (Environmental, Social, and Governance) management and employee gamification platform.

**Team Name:** Binary Duo  
**Members:**
- **Deepak Singh** *(Backend Developer / Tech Lead)*
- **Akshat Sharma** *(Frontend Developer)*

---

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, TailwindCSS, Axios, React Router, React Hook Form, Zod
- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Knex.js, JWT, bcrypt, Helmet, express-rate-limit, CORS

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally)

### 2. Database Setup
1. Open pgAdmin or your PostgreSQL CLI.
2. Create a new database named `ecosphere_db`:
   ```sql
   CREATE DATABASE ecosphere_db;
   ```

### 3. Environment Variables
1. Go to the `backend/` directory.
2. Duplicate `.env.example` and rename it to `.env`.
3. Set your PostgreSQL credentials in the `.env` file:
   ```env
   DATABASE_PASSWORD=your_postgres_password
   JWT_SECRET=some_long_random_string_at_least_32_characters
   ```

### 4. Install Dependencies
Run `npm install` in both the `frontend/` and `backend/` directories.

---

## 🚀 Running the Project

### Start the Backend
Open a terminal in the `backend/` folder and run:
```bash
# Run database migrations (only needed once)
npm run migrate

# Start the Express server in development mode
npm run dev
```

### Start the Frontend
Open a new terminal tab/window in the `frontend/` folder and run:
```bash
# Start the Vite development server
npm run dev
```

---

## 🔑 How to Get the OTP Verification Code (Testing Guide)

EcoSphere uses an **OTP-based Verification System** for Signup and Login to protect accounts. 

Since no external email server (SMTP) is mounted during local development:
1. When you click **Create Account** on the Signup page, the backend generates a 6-digit OTP.
2. **Open the terminal where you ran the backend server (`npm run dev`)**.
3. You will see a simulated email printout containing the active OTP:
   ```text
   📧 [EMAIL SIMULATION] Sent OTP to "your-email@example.com": 123456 (expires in 15 minutes)
   ```
4. Copy the **6-digit code** (e.g. `123456`) and enter it into the frontend modal to complete verification.
