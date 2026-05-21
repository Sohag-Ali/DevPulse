# DevPulse API

A backend issue tracking system built with Node.js, Express.js, TypeScript, and PostgreSQL.

---

# Live URL

```bash
https://your-live-link.com
```

---

# Features

- User Registration & Login
- JWT Authentication
- Role-based Authorization
- Create Issues
- Get All Issues
- Get Single Issue
- Update Issues
- Delete Issues
- Global Error Handling
- Reusable Response Utility
- PostgreSQL Database Integration
- TypeScript Support

---

# Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT
- bcryptjs
- dotenv
- cors

---

# Project Setup

## 1. Clone Repository

```bash
git clone <repository-url>
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Create `.env` File

```env
PORT=5000

CONNECTION_STRING=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5000
```

---

## 4. Run Project

### Development

```bash
npm run dev
```

### Production

```bash
npm run build

npm start
```

---

# API Endpoints

## Authentication

### Register User

```http
POST /api/auth/signup
```

---

### Login User

```http
POST /api/auth/login
```

---

# Issues

### Create Issue

```http
POST /api/issues
```

---

### Get All Issues

```http
GET /api/issues
```

Query Params:

```http
?sort=newest
?sort=oldest
?type=bug
?status=open
```

---

### Get Single Issue

```http
GET /api/issues/:id
```

---

### Update Issue

```http
PATCH /api/issues/:id
```

---

### Delete Issue

```http
DELETE /api/issues/:id
```

---

# Database Schema Summary

## Users Table

| Field | Type |
|---|---|
| id | SERIAL |
| name | VARCHAR |
| email | VARCHAR |
| password | TEXT |
| role | VARCHAR |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Issues Table

| Field | Type |
|---|---|
| id | SERIAL |
| title | VARCHAR |
| description | TEXT |
| type | VARCHAR |
| status | VARCHAR |
| reporter_id | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# Authentication

Protected routes require JWT token.

Example:

```http
Authorization: your_jwt_token
```

---

# Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```

---

# Success Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

---

# Folder Structure

```bash
src
│
├── app.ts
│
├── server.ts
│
├── config
│   └── index.ts
│
├── db
│   └── index.ts
│
├── middleware
│   ├── auth.ts
│   ├── globalErrorHandler.ts
│   ├── index.d.ts
│   └── logger.ts
│
├── modules
│   │
│   ├── auth
│   │   ├── auth.controller.ts
│   │   ├── auth.interface.ts
│   │   ├── auth.route.ts
│   │   └── auth.service.ts
│   │
│   └── issue
│       ├── issue.controller.ts
│       ├── issue.interface.ts
│       ├── issue.route.ts
│       └── issue.service.ts
│
├── types
│   └── responType.ts
│
└── utils
    ├── AppError.ts
    ├── catchAsync.ts
    └── sendResponse.ts
```

---

# Author

Developed by Sohag ALi