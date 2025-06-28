# Database Setup Guide

## Option 1: ใช้ Docker (แนะนำ)

### 1. ติดตั้ง Docker Desktop
- ดาวน์โหลดและติดตั้ง Docker Desktop จาก: https://www.docker.com/products/docker-desktop/
- เปิด Docker Desktop แล้วรอให้เริ่มต้นเสร็จ

### 2. เริ่มต้น PostgreSQL Database
```bash
# ไปที่ root directory ของโปรเจค
cd /Users/chakritpaniam/CMD-R/ComOne/one-event

# เริ่ม PostgreSQL database
docker compose up -d

# ตรวจสอบสถานะ
docker compose ps
```

### 3. เชื่อมต่อ Database (หลังจากเริ่ม Docker แล้ว)
```bash
# ไปที่ backend directory
cd one-event-be

# รันแอปพลิเคชัน
npm run start:dev
```

## Option 2: ติดตั้ง PostgreSQL ในเครื่อง

### 1. ติดตั้ง PostgreSQL
```bash
# ติดตั้งผ่าน Homebrew (macOS)
brew install postgresql@14
brew services start postgresql@14
```

### 2. สร้าง Database และ User
```bash
# เข้าสู่ PostgreSQL
psql postgres

# สร้าง user และ database
CREATE USER oneevent_user WITH PASSWORD 'oneevent_pass';
CREATE DATABASE oneevent;
GRANT ALL PRIVILEGES ON DATABASE oneevent TO oneevent_user;
\q
```

### 3. อัปเดต .env
```bash
DATABASE_URL=postgres://oneevent_user:oneevent_pass@localhost:5432/oneevent
```

## การทดสอบ API

หลังจากแอปพลิเคชันเริ่มแล้ว สามารถทดสอบ API ได้:

### Health Check
```bash
curl http://localhost:3000/health
```

### Users API
```bash
# ดูผู้ใช้ทั้งหมด
curl http://localhost:3000/users

# สร้างผู้ใช้ใหม่
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "guest"
  }'
```

## Features ที่เสร็จแล้ว ✅

1. **TypeORM Integration** - เชื่อมต่อกับ PostgreSQL
2. **User Entity** - มี fields: id, email, password, role, timestamps
3. **Password Hashing** - ใช้ bcrypt เข้ารหัส password อัตโนมัติ
4. **Validation** - ตรวจสอบข้อมูลด้วย class-validator
5. **CRUD APIs** - Create, Read, Update, Delete users
6. **Error Handling** - จัดการ errors อย่างเหมาะสม
7. **UUID Primary Keys** - ใช้ UUID แทน auto-increment
8. **Database Configuration** - แยกการตั้งค่า database

## ขั้นตอนถัดไป 🚀

1. **Authentication System** - JWT login/logout
2. **Authorization Guards** - ป้องกันการเข้าถึง APIs
3. **Event Module** - จัดการ events
4. **Registration Module** - จัดการการลงทะเบียน
5. **Email Notifications** - ส่งอีเมลแจ้งเตือน
