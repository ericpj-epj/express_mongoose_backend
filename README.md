# Express Mongoose Backend

A modular Node.js backend built with Express and MongoDB (Mongoose), implementing authentication, OTP workflows, member management, and organization-based access control.

## 🚀 Features

* JWT Authentication
* OTP Email Verification & Password Reset
* Member Management
* Organization Management
* Role-Based Access Control (Admin / Member)
* Access Control per App/Tool
* Modular MVC + Service Architecture
* Rate-limited OTP system
* Email notification support

---

## 📂 Project Structure

```
express_mongoose_backend/
│
├── controller/     # Route controllers (HTTP layer)
├── model/          # Mongoose schemas
├── routes/         # Express routes
├── services/       # Business logic layer
├── utils/          # Helpers (email, otp, validation, etc.)
├── data/           # Seed or static data
├── index.js        # App entry point
└── .gitignore
```

---

## 🧱 Architecture

This project follows a layered architecture:

```
Routes → Controllers → Services → Models → Database
```

**Controllers**

* Handle HTTP requests/responses
* Validate inputs
* Call services

**Services**

* Business logic
* OTP generation
* Auth flows
* Member operations

**Models**

* MongoDB collections via Mongoose

---

## ⚙️ Installation

```bash
git clone https://github.com/ericpj-epj/express_mongoose_backend.git
cd express_mongoose_backend
npm install
```

---

## ▶️ Running the Server

```bash
npm start
```

or (dev mode)

```bash
npm run dev
```

Server runs on:

```
http://localhost:3000
```

---

## 🔐 Authentication

Auth uses JWT.

Example header:

```
Authorization: Bearer <token>
```

---

## 📧 OTP Flow

Supported purposes:

* `email_confirmation`
* `password_reset`

Flow:

1. Request OTP
2. Receive email
3. Verify OTP
4. Complete action

---

## 👤 Member Roles

| Role   | Permissions             |
| ------ | ----------------------- |
| Admin  | Manage members & access |
| Member | Access own data         |

---

## 🔑 Access Control

Each member has tool access flags:

```json
{
  "leadlogic": true,
  "signals": false,
  "skutrition": true,
  "internal_tools": false
}
```

---

## 📡 Example Endpoints

### Auth

```
POST /api/auth/request-otp
POST /api/auth/verify-otp
POST /api/auth/login
```

### Members

```
GET    /api/members/:member_id
GET    /api/members/:member_id/access
PATCH  /api/members/:member_id/status
POST   /api/members/:member_id/reset-password
```

### Organizations

```
GET /api/organizations/:org_id/members
```

---

## ❌ Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Common codes:

* `VALIDATION_ERROR`
* `FORBIDDEN`
* `MEMBER_NOT_FOUND`
* `INVALID_EMAIL_DOMAIN`
* `SERVER_ERROR`

---

## 🧪 Environment Variables

Create `.env`:

```
PORT=3000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
EMAIL_HOST=smtp_host
EMAIL_USER=smtp_user
EMAIL_PASS=smtp_pass
```

---

## 📦 Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* No
