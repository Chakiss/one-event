# 🔍 Railway Deployment Troubleshooting Guide

## 🚨 ปัญหาที่พบบ่อยและวิธีแก้

### 1. 📋 Build Failures

#### ตรวจสอบ Build Logs:
```bash
# ใน Terminal
railway logs [service-name]

# หรือใน Railway Dashboard
Project > Service > Logs tab
```

#### ปัญหา Backend Build:
```
❌ Error: Cannot find module 'xxx'
✅ Fix: ตรวจสอบ package.json dependencies

❌ Error: Docker build failed
✅ Fix: ตรวจสอบ Dockerfile syntax

❌ Error: TypeScript compilation failed
✅ Fix: ตรวจสอบ TypeScript errors
```

#### ปัญหา Frontend Build:
```
❌ Error: NEXT_PUBLIC_API_URL is not defined
✅ Fix: ตั้งค่า environment variable

❌ Error: Module not found
✅ Fix: npm install ใน local แล้ว push

❌ Error: Out of memory
✅ Fix: เพิ่ม NODE_OPTIONS="--max-old-space-size=1024"
```

### 2. 🌐 Environment Variables Issues

#### ตรวจสอบ Variables:
```
1. ไป Service > Variables tab
2. ตรวจสอบ required variables มีครบ:

Backend:
- NODE_ENV=production
- JWT_SECRET=xxx
- EMAIL_USER=xxx
- EMAIL_PASS=xxx

Frontend:
- NEXT_PUBLIC_API_URL=xxx
```

#### Auto-Generated Variables:
```
Railway สร้างให้อัตโนมัติ:
- PORT (Backend)
- DATABASE_URL (Backend)
- REDIS_URL (Backend)

ไม่ต้องตั้งเอง!
```

### 3. 🔗 API Connection Problems

#### ตรวจสอบ Backend URL:
```bash
# Test health endpoint
curl https://your-backend.up.railway.app/health

# Expected response:
{"status":"ok","timestamp":"..."}

# ถ้าได้ 404 หรือ error:
# 1. ตรวจสอบ Backend deploy สำเร็จ
# 2. ตรวจสอบ health route exists
# 3. ตรวจสอบ PORT configuration
```

#### CORS Issues:
```javascript
// ใน Backend (main.ts หรือ app.module.ts)
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.up.railway.app'
  ],
  credentials: true
});
```

### 4. 💾 Database Connection

#### ตรวจสอบ Database:
```bash
# ใน Railway Dashboard
Database service > Connect tab

# Test connection:
railway connect postgresql
\l  # list databases
\q  # quit
```

#### Database URL Format:
```
postgresql://user:password@host:port/database
```

### 5. 🔧 Service Configuration

#### ตรวจสอบ railway.json:
```json
// Backend
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm run start:prod"
  }
}

// Frontend  
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.railway"
  },
  "deploy": {
    "startCommand": "node server.js"
  }
}
```

## 🎯 Step-by-Step Debug Process

### Step 1: ตรวจสอบ Services Status
```
1. ไป Railway Dashboard
2. ดู Project overview
3. ตรวจสอบ service status:
   - 🟢 Running = OK
   - 🔴 Failed = มีปัญหา
   - 🟡 Building = กำลัง build
```

### Step 2: ตรวจสอบ Logs
```
1. คลิกที่ service ที่มีปัญหา
2. ไป Logs tab
3. ดู error messages
4. หา pattern ของ errors
```

### Step 3: ตรวจสอบ Variables
```
1. ไป Variables tab
2. ตรวจสอบ required variables
3. ตรวจสอบ format ถูกต้อง
4. ไม่มี typos
```

### Step 4: ทดสอบ Local
```bash
# Test locally first
cd one-event-be
npm run build
npm run start:prod

cd ../one-event-fe  
npm run build
npm start
```

## 🔍 Common Error Messages

### Backend Errors:
```
❌ "Port already in use"
✅ Railway จัดการ PORT อัตโนมัติ

❌ "Database connection failed"
✅ ตรวจสอบ DATABASE_URL

❌ "JWT secret not found"
✅ ตั้งค่า JWT_SECRET

❌ "Email configuration error"  
✅ ตรวจสอบ EMAIL_USER, EMAIL_PASS
```

### Frontend Errors:
```
❌ "API_URL is not defined"
✅ ตั้งค่า NEXT_PUBLIC_API_URL

❌ "Network error"
✅ ตรวจสอบ Backend URL accessible

❌ "CORS error"
✅ ตั้งค่า CORS ใน Backend

❌ "Build timeout"
✅ เพิ่ม memory limit
```

## 📞 Debug Commands

### Railway CLI Commands:
```bash
# Login
railway login

# Link to project
railway link

# Check status
railway status

# View logs
railway logs

# View variables
railway variables

# Deploy manually
railway up
```

### Testing Commands:
```bash
# Test backend health
curl https://your-backend.up.railway.app/health

# Test with headers
curl -H "Content-Type: application/json" \
     https://your-backend.up.railway.app/api/events

# Check DNS
nslookup your-backend.up.railway.app
```

## 🆘 When All Else Fails

### 1. Redeploy Everything:
```
1. ไป each service
2. คลิก "Redeploy"
3. รอให้เสร็จ
```

### 2. Check Railway Status:
```
ไป https://status.railway.app
ตรวจสอบ service outages
```

### 3. Start Fresh:
```
1. สร้าง new project
2. ทำตาม guide ใหม่
3. เปรียบเทียบ settings
```

---

**💡 Tip: Screenshot ข้อผิดพลาดใน Railway Dashboard แล้วอธิบายปัญหา จะช่วยได้มากขึ้น!**
