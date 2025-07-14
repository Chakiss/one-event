# 🚀 OneEvent GCP Deployment Guide

## ภาพรวม
คู่มือนี้จะช่วยคุณย้าย OneEvent จาก Local Production ขึ้น Google Cloud Platform (GCP) ผ่าน Docker และ Cloud Run

## 📋 สิ่งที่ต้องเตรียม

### ✅ Prerequisites
- [x] Docker Desktop ติดตั้งแล้วและเปิดอยู่
- [x] Google Cloud CLI (gcloud) ติดตั้งแล้ว
- [x] GCP Project `one-event-production` พร้อมใช้งาน
- [x] GCP Billing Account เปิดแล้ว
- [x] Local Production ทำงานได้ปกติ

### 🛠️ ติดตั้ง Tools (ถ้ายังไม่มี)

```bash
# ติดตั้ง Google Cloud CLI (macOS)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# หรือใช้ Homebrew
brew install --cask google-cloud-sdk
```

## 🚀 วิธีการ Deploy

### Option 1: Quick Deploy (แนะนำ)
```bash
# รันคำสั่งเดียวครบทุกอย่าง
./deploy-gcp.sh
```

เลือกตัวเลือก:
- `1` - เตรียมสภาพแวดล้อมอย่างเดียว
- `2` - Deploy แบบเต็ม (เตรียม + deploy)
- `3` - Deploy อย่างเดียว
- `4` - ทดสอบ Local Production ก่อน
- `5` - ตรวจสอบสถานะ GCP ปัจจุบัน

### Option 2: Step by Step

#### Step 1: เตรียมสภาพแวดล้อม
```bash
./scripts/prepare-gcp-deploy.sh
```

#### Step 2: Deploy ขึ้น GCP
```bash
./scripts/deploy-to-gcp.sh
```

## 📊 สิ่งที่จะเกิดขึ้น

### 🔧 Pre-deployment Setup
1. ✅ ตรวจสอบ Docker และ gcloud CLI
2. ✅ ตรวจสอบ GCP authentication
3. ✅ เปิด GCP APIs ที่จำเป็น
4. ✅ สร้าง Artifact Registry repository
5. ✅ สร้าง Cloud SQL instance (PostgreSQL)
6. ✅ สร้างไฟล์ `.env.gcp`

### 🚀 Deployment Process
1. 📦 Build Docker images สำหรับ Frontend และ Backend
2. 📤 Push images ไป Artifact Registry
3. 🌐 Deploy Backend ไป Cloud Run
4. 🌐 Deploy Frontend ไป Cloud Run
5. 🔗 เชื่อมต่อ Database และตั้งค่า Environment Variables
6. ✅ Health checks

## 🌐 URLs หลัง Deploy เสร็จ

### Production Services
- **Frontend**: `https://one-event-web-prod-712057384144.asia-southeast1.run.app`
- **Backend**: `https://one-event-api-prod-712057384144.asia-southeast1.run.app`
- **API Documentation**: `[Backend URL]/api`

## ⚙️ Configuration Files

### `.env.gcp` (สร้างอัตโนมัติ)
```env
# GCP Deployment Environment Variables
PROJECT_ID=one-event-production
REGION=asia-southeast1

# Email configuration (ต้องแก้ไข)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=OneEvent <your-email@gmail.com>

# Database (ตั้งอัตโนมัติ)
DATABASE_HOST=/cloudsql/one-event-production:asia-southeast1:one-event-db-prod
DATABASE_PASSWORD=OneEvent2025Secure!

# JWT Secret (ตั้งอัตโนมัติ)
JWT_SECRET=OneEvent2025JWT_Secret_Key_Very_Secure_Random_String
```

## 🔧 GCP Resources ที่สร้าง

### Cloud Run Services
- `one-event-web-prod` - Frontend (Next.js)
- `one-event-api-prod` - Backend (NestJS)

### Cloud SQL
- Instance: `one-event-db-prod`
- Database: `one_event_production`
- Type: PostgreSQL 14
- Tier: db-f1-micro

### Artifact Registry
- Repository: `one-event-repo`
- Location: `asia-southeast1`
- Type: Docker

## 📋 Commands หลัง Deploy

### ตรวจสอบสถานะ
```bash
# ดู Cloud Run services
gcloud run services list --region=asia-southeast1

# ดู Cloud SQL instances
gcloud sql instances list

# ดู logs
gcloud logs read --log-filter="resource.type=cloud_run_revision"
```

### อัพเดท Services
```bash
# อัพเดท Backend
gcloud run deploy one-event-api-prod \
    --image asia-southeast1-docker.pkg.dev/one-event-production/one-event-repo/one-event-backend:latest

# อัพเดท Frontend
gcloud run deploy one-event-web-prod \
    --image asia-southeast1-docker.pkg.dev/one-event-production/one-event-repo/one-event-frontend:latest
```

### ลบ Services (ถ้าต้องการ)
```bash
# ลบ Cloud Run services
gcloud run services delete one-event-web-prod --region=asia-southeast1
gcloud run services delete one-event-api-prod --region=asia-southeast1

# ลบ Cloud SQL instance
gcloud sql instances delete one-event-db-prod
```

## 🚨 Troubleshooting

### 1. Docker Build ล้มเหลว
```bash
# ตรวจสอบ Docker daemon
docker info

# ล้าง Docker cache
docker system prune -a
```

### 2. กรณี gcloud authentication ล้มเหลว
```bash
# Re-authenticate
gcloud auth login
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

### 3. Cloud Run deployment ล้มเหลว
```bash
# ดู logs ของ service
gcloud run services describe one-event-api-prod --region=asia-southeast1

# ดู revision logs
gcloud logs read --log-filter="resource.type=cloud_run_revision" --limit=50
```

### 4. Database connection ล้มเหลว
```bash
# ตรวจสอบ Cloud SQL instance
gcloud sql instances describe one-event-db-prod

# ทดสอบ connection
gcloud sql connect one-event-db-prod --user=postgres
```

## 💰 Cost Estimation

### Cloud Run (Free Tier)
- 2 million requests/month
- 400,000 GB-seconds/month
- 200,000 CPU-seconds/month

### Cloud SQL (Paid)
- db-f1-micro: ~$7-10/month
- 10GB storage: ~$1.7/month

### Artifact Registry
- 0.5GB storage: ~$0.10/month

**Total: ~$9-12/month**

## 📚 Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL for PostgreSQL](https://cloud.google.com/sql/docs/postgres)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [OneEvent API Documentation](https://one-event-api-prod-712057384144.asia-southeast1.run.app/api)

## 🎯 Next Steps หลัง Deploy

1. ✅ ตั้งค่า Custom Domain (ถ้าต้องการ)
2. ✅ ตั้งค่า SSL Certificate
3. ✅ ตั้งค่า Email Service (Gmail SMTP)
4. ✅ ตั้งค่า Monitoring และ Alerting
5. ✅ Setup CI/CD Pipeline กับ GitHub Actions

---

## 📞 Support

หากมีปัญหาในการ Deploy สามารถ:
1. ตรวจสอบ logs ด้วยคำสั่งข้างต้น
2. ดู GCP Console สำหรับ errors
3. รัน health checks ด้วย `curl [SERVICE_URL]/health`
