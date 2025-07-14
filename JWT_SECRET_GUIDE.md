# 🔐 JWT_SECRET Configuration Guide

## 🎯 JWT_SECRET คือ?

**JWT_SECRET** คือ secret key ที่ใช้สำหรับ:
- เข้ารหัส JWT tokens
- ตรวจสอบความถูกต้องของ tokens
- ป้องกันการปลอมแปลง tokens

## 🔑 JWT_SECRET สำหรับ Railway

### สำหรับ OneEvent Project:
```
JWT_SECRET=31441684d1c387c30c74cab9072a700084eb52d91ecea122a3fb4025548de954
```

### วิธีสร้าง JWT_SECRET ใหม่:
```bash
# วิธีที่ 1: ใช้ OpenSSL (แนะนำ)
openssl rand -hex 32

# วิธีที่ 2: ใช้ Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# วิธีที่ 3: Online Generator
# ไป https://randomkeygen.com/
```

## 📋 Environment Variables สำหรับ Railway

### Backend Service Variables:
```
NODE_ENV=production
PORT=$PORT
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
JWT_SECRET=31441684d1c387c30c74cab9072a700084eb52d91ecea122a3fb4025548de954
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=OneEvent <noreply@oneevent.demo>
```

### คำอธิบาย:
- **NODE_ENV**: ตั้งเป็น `production`
- **PORT**: Railway จะกำหนดให้อัตโนมัติ
- **DATABASE_URL**: Railway จะสร้างให้อัตโนมัติเมื่อเพิ่ม PostgreSQL
- **REDIS_URL**: Railway จะสร้างให้อัตโนมัติเมื่อเพิ่ม Redis
- **JWT_SECRET**: ใช้ค่าที่สร้างไว้ข้างบน
- **EMAIL_USER**: Gmail address ของคุณ
- **EMAIL_PASS**: Gmail App Password (ไม่ใช่รหัสผ่านปกติ)

## 📧 Gmail App Password Setup

### วิธีสร้าง Gmail App Password:

1. **ไป Google Account Settings:**
   - [myaccount.google.com](https://myaccount.google.com)

2. **Enable 2-Factor Authentication:**
   - Security > 2-Step Verification > Turn On

3. **สร้าง App Password:**
   - Security > App passwords
   - Select app: "Mail"
   - Select device: "Other"
   - ใส่ชื่อ: "OneEvent Railway"
   - Copy generated password

4. **ใช้ App Password:**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcd-efgh-ijkl-mnop  # 16 หลักที่ได้จาก App Password
   ```

## 🔒 Security Best Practices

### ข้อควรระวัง:
- ❌ **ห้าม** commit JWT_SECRET ลง Git
- ❌ **ห้าม** share JWT_SECRET ในที่สาธารณะ
- ✅ **ควร** ใช้ environment variables เท่านั้น
- ✅ **ควร** สร้าง JWT_SECRET ใหม่ทุก environment

### การจัดการ Secrets:
```bash
# ✅ ถูกต้อง - ใน Railway Variables
JWT_SECRET=31441684d1c387c30c74cab9072a700084eb52d91ecea122a3fb4025548de954

# ❌ ผิด - อย่าใส่ใน code
const jwtSecret = "my-secret-key"
```

## 🧪 ทดสอบ JWT_SECRET

### วิธีทดสอบว่า JWT ทำงาน:
```bash
# Test login endpoint
curl -X POST https://your-backend.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# ควรได้ JWT token กลับมา
```

## 🔄 การเปลี่ยน JWT_SECRET

### เมื่อต้องเปลี่ยน JWT_SECRET:

1. **สร้าง secret ใหม่:**
   ```bash
   openssl rand -hex 32
   ```

2. **อัปเดตใน Railway:**
   - ไป Variables tab
   - แก้ไข JWT_SECRET
   - Restart service

3. **ผลข้างเคียง:**
   - Users ทุกคนต้อง login ใหม่
   - JWT tokens เก่าจะไม่ใช้งานได้

---

**สรุป:** ใช้ `31441684d1c387c30c74cab9072a700084eb52d91ecea122a3fb4025548de954` เป็น JWT_SECRET ใน Railway Variables ได้เลย! 🔐
