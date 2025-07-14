# 🚄 คู่มือ Migrate จาก GCP ไป Railway

## 🎯 เป้าหมาย
ย้าย OneEvent จาก Google Cloud Platform ไป Railway เพื่อประหยูดค่าใช้จ่ายสำหรับ showcase

## 📋 Checklist ก่อน Migrate

- [ ] Export ข้อมูลจาก GCP Database
- [ ] Backup files และ configurations
- [ ] เตรียม GitHub repository
- [ ] ตั้งค่า environment variables
- [ ] ทดสอบ Railway deployment

## 🔄 ขั้นตอนการ Migration

### Step 1: เตรียม Code Repository
```bash
# 1. Commit changes ทั้งหมดไป GitHub
git add .
git commit -m "Prepare for Railway migration"
git push origin main

# 2. สร้าง Railway-specific configs
./deploy-railway.sh help
```

### Step 2: Export ข้อมูลจาก GCP
```bash
# Export PostgreSQL database
gcloud sql export sql YOUR_INSTANCE_NAME gs://YOUR_BUCKET/database-backup.sql \
  --database=one_event_production

# Download backup file
gsutil cp gs://YOUR_BUCKET/database-backup.sql ./database-backup.sql
```

### Step 3: Setup Railway
```bash
# ติดตั้ง Railway CLI
npm install -g @railway/cli

# Login และสร้าง project
railway login
railway new
```

### Step 4: Deploy to Railway
```bash
# ใช้ script ที่เตรียมไว้
./deploy-railway.sh deploy
```

### Step 5: Import ข้อมูล
```bash
# Connect to Railway database
railway connect postgresql

# Import data (ใน Railway console)
\i database-backup.sql
```

### Step 6: Update DNS (ถ้ามี custom domain)
```
# เปลี่ยน DNS records ชื้ไปที่ Railway
# จาก GCP Load Balancer IP
# ไปที่ Railway domain
```

### Step 7: ทดสอบ
```bash
# Test APIs
curl https://your-railway-backend.railway.app/health

# Test Frontend
curl https://your-railway-frontend.railway.app
```

## ⚙️ Configuration Changes

### 1. Environment Variables
```bash
# Backend (.env)
NODE_ENV=production
PORT=$PORT  # Railway auto-assigns
DATABASE_URL=$DATABASE_URL  # Railway auto-assigns
REDIS_URL=$REDIS_URL  # Railway auto-assigns
JWT_SECRET=your-new-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 2. Frontend Config
```javascript
// next.config.ts - Railway optimization
const nextConfig = {
  output: 'standalone',  // สำหรับ Railway
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
      },
    ]
  },
}
```

## 📊 การติดตาม Costs

### Railway Dashboard
- ดู usage statistics
- ตั้ง spending limits
- Monitor performance metrics

### Cost Optimization
```bash
# ลด resource usage
# 1. Database connection pooling
# 2. Image optimization
# 3. Static asset caching
# 4. API rate limiting
```

## 🛠️ Troubleshooting

### Database Connection Issues
```sql
-- ตรวจสอบ connection
SELECT version();
SELECT current_database();
```

### Memory Issues
```dockerfile
# ปรับ Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=512"
```

### Build Timeouts
```json
// package.json - เพิ่ม timeout
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=1024' next build"
  }
}
```

## 🔒 Security Checklist

- [ ] เปลี่ยน JWT secrets
- [ ] Update CORS settings
- [ ] ตั้งค่า rate limiting
- [ ] Enable HTTPS only
- [ ] Environment variables security

## 📈 Performance Optimization

### Railway-specific optimizations:
```dockerfile
# Multi-stage Docker builds
FROM node:18-alpine AS builder
# ... build stage

FROM node:18-alpine AS runner
# ... runtime stage
```

### Database optimization:
```sql
-- Connection pooling
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Index optimization
ANALYZE;
REINDEX;
```

## 🔙 Rollback Plan

หากมีปัญหา สามารถ rollback ได้:

1. **DNS Rollback**: เปลี่ยน DNS กลับไป GCP
2. **Data Sync**: Sync ข้อมูลล่าสุดกลับ GCP
3. **Service Restart**: Restart GCP services

```bash
# Quick rollback commands
gcloud run services update backend --region=asia-southeast1
gcloud sql instances restart YOUR_INSTANCE
```

## 📞 Support Resources

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- GitHub Issues: สำหรับ project-specific issues

## 🎉 Success Metrics

การ migrate สำเร็จเมื่อ:
- [ ] Application accessible ปกติ
- [ ] Database ทำงานถูกต้อง
- [ ] Email system ทำงาน
- [ ] Performance ยอมรับได้
- [ ] Cost ลดลงอย่างน้อย 70%

---

**Expected Cost Savings**: จาก ~$70/เดือน (GCP) เหลือ ~$5-15/เดือน (Railway) = ประหยูด 80%! 🎉
