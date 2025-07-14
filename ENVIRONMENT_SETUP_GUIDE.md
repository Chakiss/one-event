# 📝 Step-by-Step Environment Variables Setup

## 🔧 Backend Environment Variables

### ใน Railway Dashboard > Backend Service > Variables:

```
NODE_ENV=production
JWT_SECRET=31441684d1c387c30c74cab9072a700084eb52d91ecea122a3fb4025548de954
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=OneEvent <noreply@oneevent.demo>
```

**หมายเหตุ:** 
- `PORT`, `DATABASE_URL`, `REDIS_URL` Railway จะสร้างให้อัตโนมัติ
- แทนที่ `your-email@gmail.com` และ `your-gmail-app-password`

## 🎨 Frontend Environment Variables  

### ขั้นตอนที่ 1: รอ Backend Deploy เสร็จ
1. ตรวจสอบ Backend service สถานะ "Running"
2. ทดสอบ Backend URL: `curl https://your-backend.up.railway.app/health`

### ขั้นตอนที่ 2: หา Backend URL
1. ไปที่ Backend service ใน Railway Dashboard
2. คลิก Settings tab
3. ดูใน section "Domains"
4. Copy URL (รูปแบบ: `https://xxx.up.railway.app`)

### ขั้นตอนที่ 3: ตั้งค่า Frontend
ใน Railway Dashboard > Frontend Service > Variables:

```
NEXT_PUBLIC_API_URL=https://[PASTE-BACKEND-URL-HERE]
```

**ตัวอย่าง:**
```
NEXT_PUBLIC_API_URL=https://one-event-backend-production-a1b2c3.up.railway.app
```

## 📋 Gmail App Password Setup

### ขั้นตอนการสร้าง:

1. **ไป Google Account:**
   - [myaccount.google.com](https://myaccount.google.com)

2. **เปิด 2-Factor Authentication:**
   - Security > 2-Step Verification > Turn On

3. **สร้าง App Password:**
   - Security > App passwords
   - Select app: "Mail" 
   - Select device: "Other (Custom name)"
   - ใส่ชื่อ: "Railway OneEvent"
   - คลิก "Generate"

4. **Copy Password:**
   - จะได้ password 16 หลัก เช่น: `abcd efgh ijkl mnop`
   - ใส่ใน `EMAIL_PASS` (ไม่ต้องมีเว้นวรรค)

## ✅ Variables Checklist

### Backend Service:
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET=31441684d1c387c30c74cab9072a700084eb52d91ecea122a3fb4025548de954`
- [ ] `EMAIL_USER=your-actual-email@gmail.com`
- [ ] `EMAIL_PASS=your-16-digit-app-password`
- [ ] `EMAIL_HOST=smtp.gmail.com`
- [ ] `EMAIL_PORT=587`
- [ ] `EMAIL_SECURE=false`
- [ ] `EMAIL_FROM=OneEvent <noreply@oneevent.demo>`

### Frontend Service:
- [ ] `NEXT_PUBLIC_API_URL=https://actual-backend-url.up.railway.app`

### Auto-Generated (Railway จัดการ):
- [ ] `PORT` (Backend)
- [ ] `DATABASE_URL` (Backend)
- [ ] `REDIS_URL` (Backend)

## 🔄 การ Redeploy หลังตั้งค่า Variables

### Backend:
1. ไปที่ Backend service
2. คลิก "Deploy" หรือ push code ใหม่
3. รอให้ build เสร็จ

### Frontend:
1. ไปที่ Frontend service  
2. คลิก "Deploy" หรือ push code ใหม่
3. รอให้ build เสร็จ

## 🧪 การทดสอบ

### ทดสอบ Backend:
```bash
curl https://your-backend.up.railway.app/health
# Expected: {"status":"ok","timestamp":"..."}
```

### ทดสอบ Frontend:
1. เปิด Frontend URL ใน browser
2. กด F12 เปิด Developer Console
3. ไม่ควรมี CORS errors
4. API calls ควรทำงานปกติ

---

**หลังจากตั้งค่าเสร็จ Frontend จะเรียก Backend ได้ปกติ!** 🎉
