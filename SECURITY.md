# 🛡️ EcoSphere Security Architecture (SECURITY.md)

This document provides an overview of the security measures, protection patterns, and threat mitigations implemented across the EcoSphere platform.

---

## 🔒 1. Authentication & Session Management

### Hashed Password Storage
- User passwords are never stored in plaintext. We enforce hashing using **Bcrypt** with **12 rounds of salt** (above standard library defaults) to prevent dictionary and brute-force cracking attacks.

### Time-To-Live (TTL) OTP Verification
- User registrations start in a **pending state**. The signup payload and the OTP are cached temporarily in a short-TTL memory store (15 minutes). No record is created in PostgreSQL until verification is successful.
- **Single-Use Enforcement:** The OTP cache entry is immediately deleted the moment the code is verified or when it expires.
- **Guesses Lockout:** If a user submits an incorrect OTP **5 times**, the pending registration is automatically deleted and invalidated to block brute-force OTP guessing.

### Token Rotation (RTR)
- **Short-Lived Access Tokens:** Standard user actions are authorized using JWT access tokens with a **15-minute expiration**.
- **Cryptographic Refresh Tokens:** Long-lived session persistence uses cryptographically secure random refresh tokens (80 hex characters) stored in PostgreSQL.
- **Refresh Token Rotation (RTR):** To block replay attacks, refresh tokens are **rotated on every use**—revoking the old token and generating a fresh pair.

---

## 🛑 2. Rate Limiting & Lockout Policies

We implement tiered rate limiting via `express-rate-limit` to prevent denial-of-service (DoS) and brute-force attacks:

1. **Global Rate Limiter:** Applied to all routes, limited to `100 requests per 15 minutes` per IP (except `/health`).
2. **Auth & OTP Limiter:** Applied strictly to `/api/auth/*` endpoints, limited to `5 requests per 15 minutes` per IP (increases to `100` in development mode for seamless testing).
3. **OTP Generation Rate Limit:** Applied at the service layer, restricting OTP generation to a **maximum of 3 requests per 10 minutes** per email address to prevent terminal/SMS flooding.
4. **Account Login Lockout:** If an account experiences **5 failed login attempts**, it triggers a strict **15-minute lockout** at the service layer, preventing further password attempts.

---

## 🔌 3. Network & Payload Security

### Security Headers (Helmet)
- We mount `helmet` to automatically set secure HTTP headers (HSTS, Content-Type Options, Frame Options, etc.).
- **Strict CSP:** Configured with an explicit Content Security Policy (CSP) blocking unauthorized external inline scripts.

### Locked CORS Configuration
- Cross-Origin Resource Sharing (CORS) is strictly locked to the **exact frontend origin** (e.g. `http://localhost:5173`) rather than a wildcard (`*`), protecting session data from cross-origin requests.

### Request Payload Limits
- To block buffer overflow and memory-exhaustion flood attempts, request body sizes are restricted to **10KB** via Express JSON parser:
  ```typescript
  app.use(express.json({ limit: '10kb' }));
  ```

### Safe Error Handling
- A centralized error middleware handles all thrown exceptions.
- **Stack trace leakage prevention:** Stack traces and internal database connection/SQL errors (e.g., Knex syntax exceptions) are filtered out, returning a generic error payload to clients.

---

## 🗄️ 4. Data & Input Validation

### SQL Injection Protection
- We enforce database writes and reads using the **Knex query builder**. Parameterized queries are automatically generated under the hood, completely mitigating SQL injection vulnerabilities.

### Server-Side Zod Validation
- All write path payloads (Signup, Login, OTP verify, Department CRUD, Category CRUD) are strictly validated server-side using **Zod schemas** before database execution.

### XSS Mitigation
- Input is sanitized and validated at boundary endpoints, ensuring user-generated strings (e.g. CSR descriptions, audit findings) cannot inject stored Cross-Site Scripting (XSS) payloads.
