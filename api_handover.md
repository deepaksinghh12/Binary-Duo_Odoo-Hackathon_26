# 🔌 EcoSphere API Handover (Frontend Integration Guide)

This document contains the backend API routes, payload structures, and sample responses for the **Authentication (OTP)**, **ESG Dashboard**, **Departments**, and **Categories** features.

---

## 🛡️ Authentication & OTP (Public)

*Base URL: `http://localhost:5000/api/auth`*

### 1. User Signup
*Registers a user in the system (starts as unverified) and sends an OTP.*
- **Method:** `POST`
- **Route:** `/signup`
- **Request Body:**
  ```json
  {
    "name": "Akshat",
    "email": "akshat@example.com",
    "password": "Password123!",
    "departmentId": "optional-uuid-here",
    "role": "employee" // optional: 'admin' | 'manager' | 'employee' (defaults to 'employee')
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful. Verification OTP sent.",
    "data": {
      "message": "Registration successful. Verification OTP sent to email.",
      "email": "akshat@example.com"
    }
  }
  ```

---

### 2. User Login
*Attempts authentication. If email is unverified, triggers a fresh OTP and instructs frontend to redirect to verification.*
- **Method:** `POST`
- **Route:** `/login`
- **Request Body:**
  ```json
  {
    "email": "akshat@example.com",
    "password": "Password123!"
  }
  ```
- **Response - Flow A (200 OK - Verified):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "user": {
        "id": "e22de970-8b17-48f5-9372-7634f186358c",
        "name": "Akshat",
        "email": "akshat@example.com",
        "role": "employee",
        "departmentId": null,
        "xpTotal": 0,
        "isVerified": true
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Response - Flow B (200 OK - Unverified account):**
  *Redirect user to OTP verification screen.*
  ```json
  {
    "success": true,
    "message": "Verification OTP sent. Verification required.",
    "data": {
      "otpRequired": true,
      "email": "akshat@example.com",
      "message": "Account not verified. Verification OTP sent."
    }
  }
  ```

---

### 3. Send/Resend OTP
- **Method:** `POST`
- **Route:** `/send-otp`
- **Request Body:**
  ```json
  {
    "email": "akshat@example.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Verification OTP sent successfully",
    "data": {
      "success": true,
      "message": "Verification OTP sent successfully."
    }
  }
  ```

---

### 4. Verify OTP
*Submit the 6-digit code. Returns user details and the active JWT token.*
- **Method:** `POST`
- **Route:** `/verify-otp`
- **Request Body:**
  ```json
  {
    "email": "akshat@example.com",
    "code": "123456" // Must be exactly 6 digits
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Account verified and logged in successfully",
    "data": {
      "user": {
        "id": "e22de970-8b17-48f5-9372-7634f186358c",
        "name": "Akshat",
        "email": "akshat@example.com",
        "role": "employee",
        "departmentId": null,
        "xpTotal": 0,
        "isVerified": true
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

## 📊 ESG Dashboard (Protected)

*Base URL: `http://localhost:5000/api/dashboard`*
*Headers:* `Authorization: Bearer <your_jwt_token>`

### 1. Get Dashboard Summary
- **Method:** `GET`
- **Route:** `/summary`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Dashboard metrics fetched successfully",
    "data": {
      "metrics": {
        "totalCo2e": 1450.25,
        "socialScore": 78.5,
        "governanceRating": 82,
        "companiesCount": 1,
        "departmentsCount": 4,
        "compliancePendingIssues": 2
      },
      "environmental": {
        "totalEmissionsByScope": {
          "scope1": 450.1,
          "scope2": 600.15,
          "scope3": 400
        },
        "targetProgressPercentage": 65
      },
      "social": {
        "csrParticipationCount": 12,
        "activeParticipantsCount": 45,
        "pointsAwarded": 2400
      },
      "governance": {
        "policyAcknowledgementRate": 88.5,
        "auditsCompletedCount": 4,
        "activeComplianceIssuesCount": 2
      },
      "departmentBreakdown": [
        {
          "departmentName": "Engineering",
          "departmentCode": "ENG",
          "scores": {
            "environmental": 82,
            "social": 75,
            "governance": 88,
            "total": 81.3
          }
        },
        {
          "departmentName": "Operations",
          "departmentCode": "OPS",
          "scores": {
            "environmental": 68,
            "social": 70,
            "governance": 80,
            "total": 71.2
          }
        }
      ]
    }
  }
  ```

---

## 🏢 Department Management (Protected)

*Base URL: `http://localhost:5000/api/departments`*
*Headers:* `Authorization: Bearer <your_jwt_token>`

### 1. List Departments (Sort, Filter, Paginate)
- **Method:** `GET`
- **Route:** `/`
- **Query Parameters:**
  - `page`: default `1`
  - `limit`: default `10`
  - `search`: filters by name or code (fuzzy match)
  - `sortBy`: sort field (`name` | `code` | `employee_count` | `created_at`)
  - `sortOrder`: `asc` | `desc`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Fetched successfully",
    "data": [
      {
        "id": "c1a0e980-8b17-48f5-9372-7634f186358c",
        "name": "Engineering",
        "code": "ENG",
        "head_user_id": null,
        "parent_department_id": null,
        "employee_count": 0,
        "status": "active",
        "deleted_at": null,
        "created_at": "2026-07-12T05:07:04.000Z",
        "updated_at": "2026-07-12T05:07:04.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```

### 2. Create Department (Admin/Manager only)
- **Method:** `POST`
- **Route:** `/`
- **Request Body:**
  ```json
  {
    "name": "Engineering",
    "code": "ENG",
    "headUserId": "user-uuid-here", // optional
    "parentDepartmentId": "parent-dept-uuid-here", // optional
    "status": "active" // optional: 'active' | 'inactive' (defaults to 'active')
  }
  ```
- **Response (210 Created):** *(Standard record output)*

### 3. Update Department (Admin/Manager only)
- **Method:** `PUT`
- **Route:** `/:id`
- **Request Body:** `{ name?, code?, headUserId?, parentDepartmentId?, status? }`

### 4. Delete Department (Admin/Manager only)
- **Method:** `DELETE`
- **Route:** `/:id`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Department deleted successfully",
    "data": null
  }
  ```

---

## 🏷️ Category Management (Protected)

*Base URL: `http://localhost:5000/api/categories`*
*Headers:* `Authorization: Bearer <your_jwt_token>`

### 1. List Categories
- **Method:** `GET`
- **Route:** `/`
- **Query Parameters:**
  - `page`, `limit`, `search`, `sortBy`, `sortOrder`
  - `type`: filter by type (`csr_activity` | `challenge`)
- **Response (200 OK):** *(Standard paginated format)*

### 2. Create Category (Admin/Manager only)
- **Method:** `POST`
- **Route:** `/`
- **Request Body:**
  ```json
  {
    "name": "ESG Basics",
    "type": "csr_activity", // 'csr_activity' | 'challenge'
    "status": "active" // optional
  }
  ```

---

## 🚫 Standard Error Response Formats

### Validation Failures (422 Unprocessable Entity)
Returned when body validation checks fail.
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Authorization / Operational Failures (401 / 403 / 409)
```json
{
  "success": false,
  "message": "Email already registered" // or "Invalid credentials" or "Unauthorized"
}
```
