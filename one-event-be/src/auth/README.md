# Authentication System Guide

## Overview
ระบบ Authentication ที่ใช้ JWT (JSON Web Tokens) พร้อม Role-based Authorization

## Features ✅

### 🔐 Authentication
- **Registration**: สร้างบัญชีผู้ใช้ใหม่
- **Login**: เข้าสู่ระบบด้วย email/password
- **JWT Tokens**: ใช้ JWT สำหรับการยืนยันตัวตน
- **Password Security**: bcrypt hashing

### 👥 Authorization
- **Role-based Access**: admin, guest roles
- **Protected Routes**: ป้องกันด้วย JWT Guard
- **Admin-only Actions**: เฉพาะ admin เท่านั้น

## API Endpoints

### Public Endpoints (ไม่ต้อง Authentication)
```bash
POST /auth/register - สร้างบัญชีใหม่
POST /auth/login    - เข้าสู่ระบบ
GET  /health        - Health check
```

### Protected Endpoints (ต้องมี JWT Token)
```bash
GET  /auth/profile     - ดูข้อมูลตนเอง
GET  /auth/admin-only  - เฉพาะ admin (ทดสอบ)
GET  /users/me         - ดูโปรไฟล์ตนเอง
PATCH /users/me        - แก้ไขโปรไฟล์ตนเอง
```

### Admin-only Endpoints (ต้องเป็น admin role)
```bash
GET    /users         - ดูผู้ใช้ทั้งหมด
POST   /users         - สร้างผู้ใช้ใหม่
GET    /users/:id     - ดูผู้ใช้ตาม ID
PATCH  /users/:id     - แก้ไขผู้ใช้
DELETE /users/:id     - ลบผู้ใช้
```

## การใช้งาน

### 1. สร้างบัญชีใหม่
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "guest"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "role": "guest",
    "createdAt": "2025-06-23T...",
    "updatedAt": "2025-06-23T..."
  }
}
```

### 2. เข้าสู่ระบบ
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. เข้าถึง Protected Routes
```bash
# เก็บ token ไว้ใน variable
TOKEN="your_jwt_token_here"

# ดูโปรไฟล์ตนเอง
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/auth/profile

# ดูผู้ใช้ทั้งหมด (admin only)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/users
```

## Environment Variables

ใน `.env` ต้องมี:
```bash
JWT_SECRET=your-super-secret-jwt-key-here
```

## Security Features

### 🔒 Password Security
- bcrypt hashing with salt rounds
- Automatic password hashing on create/update
- Password validation method

### 🛡️ JWT Security
- 7-day expiration
- Bearer token authentication
- Secure secret key

### 👮 Authorization
- Role-based access control
- Guard protection on routes
- Current user injection

## Guard Usage Examples

### In Controllers
```typescript
@UseGuards(JwtAuthGuard)           // ต้อง login
@UseGuards(JwtAuthGuard, RolesGuard) // ต้อง login + role
@Roles('admin')                    // เฉพาะ admin
```

### Get Current User
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: User) {
  return user;
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

## Next Steps 🚀
1. Event Management Module
2. Registration System
3. Email Notifications
4. Refresh Tokens
5. Rate Limiting
