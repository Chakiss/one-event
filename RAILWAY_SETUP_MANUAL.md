# 🚄 Railway Manual Setup Guide - OneEvent

## 📋 ขั้นตอนการ Setup Railway

### Step 1: Login to Railway
```bash
# เปิด browser และไป https://railway.app
# สมัครสมาชิก/เข้าสู่ระบบด้วย GitHub
railway login
```

### Step 2: สร้าง Project
```bash
# สร้าง project ใหม่
railway new
# เลือกชื่อ: one-event
```

### Step 3: เพิ่ม Services

#### 3.1 เพิ่ม PostgreSQL
```bash
railway add postgresql
```

#### 3.2 เพิ่ม Redis
```bash
railway add redis
```

### Step 4: Deploy Backend
```bash
cd one-event-be
railway link
railway up
```

### Step 5: Deploy Frontend
```bash
cd ../one-event-fe
railway link
railway up
```

## 🔧 Configuration Files ที่ต้องสร้าง

### Backend: railway.json
```json
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
```

### Frontend: railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE", 
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

## 🌐 Environment Variables ที่ต้องตั้งใน Railway Dashboard

### Backend Environment:
```
NODE_ENV=production
PORT=$PORT
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
JWT_SECRET=railway-production-jwt-secret-12345
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=OneEvent <noreply@oneevent.demo>
```

### Frontend Environment:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

## 🏗️ Dockerfile สำหรับ Frontend (Production)

สร้างไฟล์ `one-event-fe/Dockerfile.production`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## 📊 Expected Results

หลังจาก deploy สำเร็จ คุณจะได้:

1. **Backend URL**: `https://one-event-backend-xxx.railway.app`
2. **Frontend URL**: `https://one-event-frontend-xxx.railway.app`
3. **Database**: PostgreSQL ที่ Railway
4. **Cache**: Redis ที่ Railway

## 💰 Cost Tracking

- **Free Tier**: $5 credit ต่อเดือน
- **Usage**: ติดตามใน Railway dashboard
- **Estimated**: $0-5 สำหรับ showcase

## 🔍 Troubleshooting

### ถ้า Build ล้มเหลว:
```bash
railway logs
```

### ถ้า Database ไม่เชื่อมต่อ:
```bash
railway variables
# ตรวจสอบ DATABASE_URL
```

### ถ้า Frontend ไม่เรียก API ได้:
- ตรวจสอบ NEXT_PUBLIC_API_URL
- ตรวจสอบ CORS settings

---

**Next Steps**: ทำตาม Step 1-5 ข้างบน แล้วจะได้ OneEvent บน Railway ฟรี! 🎉
