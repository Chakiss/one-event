# 🔧 Railway Deployment Debug - Step by Step

## 🎯 สถานการณ์ปัจจุบัน
- ✅ Railway CLI ติดตั้งแล้ว
- ✅ Login Railway แล้ว (Chakrit69@gmail.com)
- ✅ Code พร้อมใน GitHub
- ✅ Configuration files ครบ
- ❌ **ยังไม่ได้สร้าง Railway project**

## 🚀 ขั้นตอนการแก้ไข

### Option 1: สร้าง Project ใหม่ผ่าน Web (แนะนำ)

1. **ไป Railway Dashboard:**
   - เปิด [railway.app](https://railway.app)
   - Login ด้วย GitHub (Chakrit69@gmail.com)

2. **สร้าง Project:**
   - คลิก "New Project"
   - เลือก "Deploy from GitHub repo"
   - เลือก repo: `Chakiss/one-event`

3. **Setup Services ตามลำดับ:**

   **Step 1: Add Database Services**
   ```
   1. คลิก "+ Add Service"
   2. เลือก "Database" > "PostgreSQL"
   3. คลิก "+ Add Service"
   4. เลือก "Database" > "Redis"
   ```

   **Step 2: Deploy Backend**
   ```
   1. คลิก "+ Add Service"
   2. เลือก "GitHub Repo"
   3. เลือก repo: one-event
   4. Set Root Directory: one-event-be
   5. ใน Variables tab เพิ่ม:
      NODE_ENV=production
      JWT_SECRET=31441684d1c387c30c74cab9072a700084eb52d91ecea122a3fb4025548de954
      EMAIL_USER=your-email@gmail.com
      EMAIL_PASS=your-gmail-app-password
   6. Deploy
   ```

   **Step 3: รอ Backend Deploy เสร็จ**
   ```
   - ดู Logs tab ถ้ามี errors
   - รอจนสถานะเป็น "Running"
   - Copy Backend URL จาก Settings > Domains
   ```

   **Step 4: Deploy Frontend**
   ```
   1. คลิก "+ Add Service"
   2. เลือก "GitHub Repo"
   3. เลือก repo: one-event
   4. Set Root Directory: one-event-fe
   5. ใน Variables tab เพิ่ม:
      NEXT_PUBLIC_API_URL=[Backend URL ที่ได้จาก Step 3]
   6. Deploy
   ```

### Option 2: ใช้ Railway CLI

```bash
# สร้าง project ใหม่
railway new

# หรือ link กับ project ที่มีอยู่
railway link

# ตรวจสอบ status
railway status
```

## 🔍 ปัญหาที่อาจพบ

### 1. Build Errors

**Backend Build Fails:**
```bash
# ดู logs
railway logs backend-service-name

# Common issues:
- Missing environment variables
- Docker build timeout
- npm install errors
```

**Frontend Build Fails:**
```bash
# ดู logs  
railway logs frontend-service-name

# Common issues:
- Missing NEXT_PUBLIC_API_URL
- Build timeout (ใช้เวลานาน)
- Memory issues
```

### 2. Environment Variables

**ตรวจสอบ Backend Variables:**
```
✅ NODE_ENV=production
✅ JWT_SECRET=31441684d1c387c30c74cab9072a700084eb52d91ecea122a3fb4025548de954
✅ EMAIL_USER=your-actual-email@gmail.com
✅ EMAIL_PASS=your-16-digit-app-password
⚠️  PORT, DATABASE_URL, REDIS_URL = Railway สร้างให้อัตโนมัติ
```

**ตรวจสอบ Frontend Variables:**
```
✅ NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
❌ ห้ามมี / ต้ายท้าย
❌ ห้ามมี /api ท้าย
```

### 3. Service Dependencies

**ลำดับที่ถูกต้อง:**
```
1. PostgreSQL Database ✅
2. Redis Database ✅
3. Backend Service (รอให้เสร็จ) ✅
4. Frontend Service ✅
```

## 🧪 การทดสอบ

### ทดสอบ Backend:
```bash
# Test health endpoint
curl https://your-backend.up.railway.app/health

# Expected response:
{"status":"ok","timestamp":"2025-01-15T..."}
```

### ทดสอบ Frontend:
```bash
# เปิดใน browser
https://your-frontend.up.railway.app

# ดู Console (F12) ไม่ควรมี:
- CORS errors
- Network errors
- API connection errors
```

## 📞 Quick Commands

```bash
# ตรวจสอบ Railway status
./railway-debug.sh status

# ดู logs
./railway-debug.sh logs

# ดู variables
./railway-debug.sh vars

# Test deployed services
./railway-debug.sh test
```

## 🎯 Next Steps

1. **ไป Railway Dashboard** และสร้าง project
2. **Follow** ขั้นตอนข้างบน
3. **Report back** ถ้ามี errors ใน Logs
4. **Use debug commands** เพื่อตรวจสอบ

---

**💡 Tip: Screenshot Railway Dashboard หรือ error messages จะช่วยให้ debug ได้ตรงจุดขึ้น!**
