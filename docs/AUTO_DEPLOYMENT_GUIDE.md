# OneEvent - Auto-Deployment ขึ้น GCP

คู่มือการตั้งค่าให้ push code แล้วขึ้น GCP อัตโนมัติ

## 🚀 วิธีการตั้งค่า Auto-Deployment

### ข้อกำหนดเบื้องต้น

1. **Google Cloud Platform Account** พร้อม billing enabled
2. **GitHub Account** พร้อม repo access
3. **gcloud CLI** ติดตั้งแล้ว ([ดาวน์โหลด](https://cloud.google.com/sdk/docs/install))
4. **GitHub CLI** ติดตั้งแล้ว ([ดาวน์โหลด](https://cli.github.com/))

### ขั้นตอนการตั้งค่า

#### 1. Authentication
```bash
# Login ใน gcloud
gcloud auth login

# Login ใน GitHub CLI
gh auth login
```

#### 2. รัน Auto-Setup Script
```bash
# ไปที่ project directory
cd /path/to/one-event

# รัน setup script
./scripts/setup-gcp-auto-deploy.sh
```

Script นี้จะทำให้คุณ:
- ✅ สร้าง GCP Project
- ✅ เปิด APIs ที่จำเป็น
- ✅ สร้าง Artifact Registry
- ✅ สร้าง Service Account สำหรับ GitHub Actions
- ✅ สร้าง Cloud SQL Database
- ✅ ตั้งค่า Secret Manager
- ✅ ตั้งค่า GitHub Secrets

#### 3. อัปเดต Database Password
หลังจากรัน script แล้ว คุณต้องอัปเดต database password:

```bash
# ตั้งค่า database password
gcloud sql users set-password postgres \
  --instance=one-event-db \
  --password=YOUR_SECURE_PASSWORD

# อัปเดต database URL ใน Secret Manager
gcloud secrets versions add one-event-db-url-prod \
  --data-file=<(echo "postgresql://postgres:YOUR_PASSWORD@DB_IP:5432/one_event_prod")

gcloud secrets versions add one-event-db-url-dev \
  --data-file=<(echo "postgresql://postgres:YOUR_PASSWORD@DB_IP:5432/one_event_dev")
```

## 🔄 การใช้งาน Auto-Deployment

### Deploy ไป Production
```bash
# Push ไปที่ main branch
git push origin main
```

### Deploy ไป Development
```bash
# Push ไปที่ develop branch  
git push origin develop
```

### ดู Status ของ Deployment
```bash
# ดู GitHub Actions runs
gh run list --repo=Chakiss/one-event

# ดู Cloud Run services
gcloud run services list --region=asia-southeast1
```

## 🌐 URLs หลัง Deploy

### Production
- **Frontend**: `https://one-event-web-prod-[hash]-as.a.run.app`
- **Backend**: `https://one-event-api-prod-[hash]-as.a.run.app`

### Development  
- **Frontend**: `https://one-event-web-dev-[hash]-as.a.run.app`
- **Backend**: `https://one-event-api-dev-[hash]-as.a.run.app`

## 🔧 GitHub Actions Workflow

เมื่อ push code ไป `main` หรือ `develop` branch:

1. **Test & Build** - รัน tests และ build applications
2. **Security Scan** - ตรวจสอบ vulnerabilities
3. **Build & Push** - Build Docker images และ push ไป Artifact Registry
4. **Deploy** - Deploy ไป Cloud Run
5. **Database Migration** - รัน database migrations
6. **Smoke Tests** - ทดสอบ health checks

## 📊 Monitoring & Logs

### ดู Logs
```bash
# Cloud Run logs
gcloud logs read --log-filter="resource.type=cloud_run_revision AND resource.labels.service_name=one-event-api-prod"

# GitHub Actions logs
gh run view --repo=Chakiss/one-event
```

### Monitoring
- **GCP Console**: https://console.cloud.google.com/
- **Cloud Run**: https://console.cloud.google.com/run
- **GitHub Actions**: https://github.com/Chakiss/one-event/actions

## 🔒 Security

- Service Account มีเฉพาะ permissions ที่จำเป็น
- Database credentials เก็บใน Secret Manager
- Docker images scan ด้วย Trivy
- HTTPS enforced on all services

## 🛠️ การแก้ไขปัญหา

### ถ้า Deploy ไม่สำเร็จ
1. ตรวจสอบ GitHub Actions logs
2. ตรวจสอบ GCP permissions
3. ตรวจสอบ database connectivity

### ถ้า Database connection ไม่ได้
1. ตรวจสอบ database URL ใน Secret Manager
2. ตรวจสอบ database instance status
3. ตรวจสอบ firewall rules

### Commands ที่เป็นประโยชน์
```bash
# ดู service status
gcloud run services describe one-event-api-prod --region=asia-southeast1

# ดู secrets
gcloud secrets list

# ดู database instances
gcloud sql instances list

# Force redeploy
gcloud run deploy one-event-api-prod --image=asia-southeast1-docker.pkg.dev/one-event-production/one-event-repo/one-event-backend:latest --region=asia-southeast1
```

## 📝 Environment Variables

### Production
- `NODE_ENV=production`
- `DATABASE_URL` (from Secret Manager)
- `JWT_SECRET` (from Secret Manager)

### Development
- `NODE_ENV=development`
- `DATABASE_URL` (from Secret Manager)
- `JWT_SECRET` (from Secret Manager)

## 💰 Cost Optimization

- **Cloud Run**: Pay-per-use, scales to zero
- **Cloud SQL**: db-f1-micro tier for development
- **Artifact Registry**: Free tier available
- **Secret Manager**: Minimal cost

---

## 🎯 ตัวอย่างการใช้งาน

```bash
# 1. Clone repository
git clone https://github.com/Chakiss/one-event.git
cd one-event

# 2. ตั้งค่า GCP auto-deployment
./scripts/setup-gcp-auto-deploy.sh

# 3. แก้ไข code
# ... make changes ...

# 4. Push เพื่อ deploy
git add .
git commit -m "Add new feature"
git push origin main  # Deploy to production

# 5. ดู deployment status
gh run list --repo=Chakiss/one-event
```

เท่านี้ก็เรียบร้อย! ทุกครั้งที่ push code ไป `main` branch จะได้ version ใหม่ขึ้น production ใน GCP อัตโนมัติ 🚀
