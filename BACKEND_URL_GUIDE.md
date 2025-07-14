# 🔗 วิธีหา Backend URL สำหรับ NEXT_PUBLIC_API_URL

## 🎯 NEXT_PUBLIC_API_URL คือ?

**NEXT_PUBLIC_API_URL** คือ URL ที่ Frontend (Next.js) จะใช้เรียก Backend API

## 📋 ขั้นตอนหา Backend URL

### Step 1: Deploy Backend ให้เสร็จก่อน 🔧
1. Deploy Backend service ใน Railway
2. รอให้ build เสร็จ (สถานะเป็น "Success")
3. ตรวจสอบว่า Backend service running

### Step 2: หา Backend URL 🔍
1. **ใน Railway Dashboard:**
   - คลิกที่ Backend service
   - ไปที่ tab "Settings"
   - ดูใน section "Domains"
   - จะเห็น URL แบบนี้: `https://xxx.up.railway.app`

2. **หรือใน Overview:**
   - ไปที่ Project overview
   - ดู Backend service card
   - URL จะแสดงใต้ชื่อ service

### Step 3: ทดสอบ Backend URL 🧪
```bash
# ทดสอบว่า Backend ทำงาน
curl https://your-backend-url.up.railway.app/health

# ควรได้ response:
{"status":"ok","timestamp":"2025-01-15T..."}
```

## 📝 ตัวอย่าง URL Format

### Railway URL Pattern:
```
https://[service-name]-production-[random].up.railway.app
```

### ตัวอย่างจริง:
```
Backend URL:  https://one-event-backend-production-a1b2c3.up.railway.app
Frontend URL: https://one-event-frontend-production-d4e5f6.up.railway.app
```

## ⚙️ การตั้งค่า Frontend Environment

### ใน Railway Dashboard (Frontend Service):
```
Variables tab > Add Variable:

Name:  NEXT_PUBLIC_API_URL
Value: https://one-event-backend-production-a1b2c3.up.railway.app
```

### ⚠️ สิ่งที่ต้องระวัง:
- ❌ **ห้าม** ใส่ `/` ต้ายท้าย URL
- ❌ **ห้าม** ใส่ `/api` ท้าย URL  
- ✅ **ใส่** แค่ domain เท่านั้น

### ตัวอย่างถูก/ผิด:
```bash
# ✅ ถูกต้อง
NEXT_PUBLIC_API_URL=https://backend.up.railway.app

# ❌ ผิด - มี / ท้าย
NEXT_PUBLIC_API_URL=https://backend.up.railway.app/

# ❌ ผิด - มี /api
NEXT_PUBLIC_API_URL=https://backend.up.railway.app/api
```

## 🔄 การ Update URL

### ถ้า Backend URL เปลี่ยน:
1. ไปที่ Frontend service
2. Variables tab
3. แก้ไข NEXT_PUBLIC_API_URL
4. Redeploy Frontend service

## 🧪 วิธีทดสอบการเชื่อมต่อ

### 1. ทดสอบ Backend:
```bash
curl https://your-backend.up.railway.app/health
```

### 2. ทดสอบ Frontend:
```bash
# เปิด Frontend URL ใน browser
https://your-frontend.up.railway.app

# ดู Developer Console (F12)
# ไม่ควรมี CORS errors
```

### 3. ทดสอบ API Connection:
```bash
# ใน browser console (F12)
fetch(process.env.NEXT_PUBLIC_API_URL + '/health')
  .then(r => r.json())
  .then(console.log)
```

## 📊 Troubleshooting

### ปัญหาที่พบบ่อย:

**1. CORS Error:**
```
Solution: ตรวจสอบ CORS settings ใน Backend
```

**2. Network Error:**
```
Solution: ตรวจสอบ NEXT_PUBLIC_API_URL ถูกต้อง
```

**3. 404 Not Found:**
```
Solution: ตรวจสอบ Backend service ทำงานปกติ
```

## 📋 Checklist

ก่อน set NEXT_PUBLIC_API_URL:

- [ ] Backend service deploy สำเร็จ
- [ ] Backend URL accessible
- [ ] `/health` endpoint ทำงาน
- [ ] ไม่มี `/` ท้าย URL
- [ ] ใส่ใน Frontend Variables แล้ว
- [ ] Redeploy Frontend

---

**สรุป:** หา Backend URL จาก Railway Dashboard → ใส่ใน Frontend Variables → Test! 🎯
