# 🚀 Railway Quick Deploy - OneEvent

## เริ่มต้นอย่างรวดเร็ว (5 นาที!)

### 1. เตรียม Code ✅
```bash
# Push code ไป GitHub ก่อน (ถ้ายังไม่ได้ทำ)
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. สร้าง Railway Project 🚄
1. ไป [railway.app](https://railway.app)
2. Login ด้วย GitHub
3. คลิก "New Project"
4. เลือก "Deploy from GitHub repo"
5. เลือก repository: `one-event`

### 3. Add Services 🛠️
ใน Railway Dashboard:

**Add PostgreSQL:**
1. คลิก "+ Add Service"
2. เลือก "Database" > "PostgreSQL"

**Add Redis:**
1. คลิก "+ Add Service" 
2. เลือก "Database" > "Redis"

### 4. Deploy Backend 🔧
1. คลิก "+ Add Service"
2. เลือก "GitHub Repo"
3. เลือก repository: `one-event`
4. Set Root Directory: `one-event-be`
5. ไป Variables tab เพิ่ม:
   ```
   NODE_ENV=production
   JWT_SECRET=31441684d1c387c30c74cab9072a700084eb52d91ecea122a3fb4025548de954
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### 5. Deploy Frontend 🎨
1. คลิก "+ Add Service"
2. เลือก "GitHub Repo" 
3. เลือก repository: `one-event`
4. Set Root Directory: `one-event-fe`
5. **รอให้ Backend deploy เสร็จก่อน** 
6. Copy Backend URL จาก Railway Dashboard
7. ไป Variables tab เพิ่ม:
   ```
   NEXT_PUBLIC_API_URL=https://one-event-backend-production-xxxx.up.railway.app
   ```
   ⚠️ **แทนที่ URL ด้วย Backend URL จริงที่ได้จาก Step 4**

## 🎯 หลังจาก Deploy

### ✅ ตรวจสอบ Services

**1. หา Backend URL:**
- ไปที่ Backend service ใน Railway Dashboard
- ดูใน Settings > Domains
- URL จะมีรูปแบบ: `https://service-name-production-xxxx.up.railway.app`

**2. ทดสอบ Backend:**
```bash
curl https://your-backend-url.up.railway.app/health
# ควรได้: {"status":"ok"}
```

**3. อัปเดต Frontend Environment:**
- ไปที่ Frontend service > Variables
- เพิ่ม/แก้ไข: `NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app`
- Redeploy Frontend service

**4. ทดสอบ Frontend:**
- เปิด Frontend URL ใน browser
- ตรวจสอบไม่มี CORS errors ใน Console (F12)

### 💰 ติดตาม Usage
- ไป Railway Dashboard > Usage
- ดู Resource consumption
- Free tier: $5 credit/เดือน

## 🔧 Troubleshooting

### Build Fails:
```bash
# ดู logs
railway logs [service-name]
```

### Database Connection Error:
- ตรวจสอบ DATABASE_URL ใน Variables
- ใช้ Railway-generated URL

### Frontend ไม่โหลด:
- ตรวจสอบ NEXT_PUBLIC_API_URL
- ตรวจสอบ CORS settings ใน backend

## 🎉 Success!

หลังจาก deploy สำเร็จ:

1. **Cost**: ประหยุด 80% จาก GCP!
2. **URLs**: ได้ production URLs ทันที
3. **SSL**: Auto HTTPS
4. **Monitoring**: Built-in ใน Railway Dashboard

---

**Total Time**: ~15 นาที  
**Total Cost**: $0-5/เดือน (vs $70/เดือน บน GCP)  
**Savings**: 90%+ 🎉
