# 🚀 OneEvent Auto-Deployment เสร็จแล้ว!

## ✅ สิ่งที่ตั้งค่าเสร็จแล้ว
- ✅ GCP Project: `one-event-production`
- ✅ Billing Account เปิดแล้ว
- ✅ APIs ทั้งหมดเปิดแล้ว (Cloud Run, Artifact Registry, etc.)
- ✅ Service Account และ Permissions
- ✅ Cloud SQL Database (PostgreSQL)
- ✅ GitHub Secrets ตั้งค่าแล้ว
- ✅ Artifact Registry สำหรับเก็บ Docker images

## 🚀 วิธีทดสอบ Auto-Deployment

### 1. Push Code เพื่อ Deploy
```bash
# แก้ไขไฟล์อะไรก็ได้ (เช่น README)
echo "# OneEvent - Auto Deploy Test" > TEST_DEPLOY.md

# Commit และ Push
git add .
git commit -m "🚀 Test auto-deployment to GCP"
git push origin main  # Deploy ขึ้น Production
```

### 2. ดู Deployment Progress
```bash
# ดู GitHub Actions
gh run list --repo=Chakiss/one-event

# ดู realtime logs
gh run watch --repo=Chakiss/one-event
```

### 3. หาสาย URL ของ Web หลัง Deploy

#### ใน Terminal:
```bash
# ดู Cloud Run services
gcloud run services list --region=asia-southeast1

# ดู URL โดยตรง
gcloud run services describe one-event-web-prod --region=asia-southeast1 --format="value(status.url)"
gcloud run services describe one-event-api-prod --region=asia-southeast1 --format="value(status.url)"
```

#### ใน GCP Console:
1. ไปที่: https://console.cloud.google.com/run?project=one-event-production
2. จะเห็น services ทั้งหมด และ URLs

## 🌐 URLs ที่คาดว่าจะได้

### Production (main branch)
- **Frontend**: `https://one-event-web-prod-[random]-as.a.run.app`
- **Backend**: `https://one-event-api-prod-[random]-as.a.run.app`

### Development (develop branch) 
- **Frontend**: `https://one-event-web-dev-[random]-as.a.run.app`
- **Backend**: `https://one-event-api-dev-[random]-as.a.run.app`

## ⏱️ เวลาใน Deploy

1. **GitHub Actions**: 5-10 นาที
   - Build Docker images
   - Push ไป Artifact Registry
   - Deploy ไป Cloud Run

2. **Cloud Run**: 1-2 นาที
   - Start containers
   - Health checks

## 📊 การตรวจสอบ Deployment

### ระหว่าง Deploy
```bash
# ดู GitHub Actions logs
gh run view --repo=Chakiss/one-event

# ดู Cloud Run logs
gcloud logs read --log-filter="resource.type=cloud_run_revision"
```

### หลัง Deploy เสร็จ
```bash
# Health check
curl https://one-event-api-prod-[url]/health
curl https://one-event-web-prod-[url]
```

## 🎯 Next Steps

1. **ทดสอบ Auto-Deploy**: Push code ไป main branch
2. **ดู Deployment**: ไปที่ GitHub Actions และ GCP Console
3. **เข้า Web**: ใช้ URL จาก Cloud Run
4. **Setup Custom Domain** (ถ้าต้องการ): Map domain เข้า Cloud Run

---

## 🔧 Commands สำหรับทดสอบทันที

```bash
# 1. ทดสอบ auto-deployment
git add . && git commit -m "🚀 Test auto-deployment" && git push origin main

# 2. ดู deployment status
gh run watch --repo=Chakiss/one-event

# 3. หา URLs หลัง deploy เสร็จ
gcloud run services list --region=asia-southeast1
```
