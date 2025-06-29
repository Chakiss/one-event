# 🚀 OneEvent Auto-Deployment Setup

## เครื่องมือพร้อมแล้ว ✅
- Google Cloud CLI ✅ (version 528.0.0)
- GitHub CLI ✅ (version 2.74.2)

## ขั้นตอนการตั้งค่า Auto-Deployment

### 1. Authentication
```bash
# Login gcloud (จะเปิด browser ให้ login)
gcloud auth login

# Login GitHub CLI (จะเปิด browser ให้ login)
gh auth login
```

### 2. รัน Auto-Setup Script
```bash
# ไปที่ project directory
cd /Users/chakritpaniam/CMD-R/ComOne/one-event

# รัน setup script
./scripts/setup-gcp-auto-deploy.sh
```

### 3. หลังจาก Setup เสร็จ
```bash
# Push code เพื่อ trigger deployment
git add .
git commit -m "Enable auto-deployment"
git push origin main    # Deploy to production
git push origin develop # Deploy to development
```

## ⚡ Quick Start Guide

1. **รันคำสั่งใน Terminal:**
```bash
# 1. Login gcloud
gcloud auth login

# 2. Login GitHub
gh auth login

# 3. ตั้งค่า GCP
cd /Users/chakritpaniam/CMD-R/ComOne/one-event
./scripts/setup-gcp-auto-deploy.sh
```

2. **หลังจาก Setup สำเร็จ:**
   - ทุกครั้งที่ push ไป `main` branch = deploy ขึ้น production
   - ทุกครั้งที่ push ไป `develop` branch = deploy ขึ้น development

3. **ดู Deployment Status:**
```bash
# ดู GitHub Actions
gh run list --repo=Chakiss/one-event

# ดู GCP services
gcloud run services list --region=asia-southeast1
```

## 🎯 การใช้งาน

```bash
# แก้ไข code
vim one-event-fe/src/pages/index.tsx

# Commit และ push
git add .
git commit -m "Update homepage"
git push origin main  # 🚀 Auto-deploy to production!
```

## 📋 Next Steps

1. รัน `gcloud auth login` เพื่อ login GCP
2. รัน `gh auth login` เพื่อ login GitHub  
3. รัน `./scripts/setup-gcp-auto-deploy.sh` เพื่อตั้งค่า GCP
4. Push code เพื่อทดสอบ auto-deployment

---

## 🔗 Links
- GCP Console: https://console.cloud.google.com/
- GitHub Actions: https://github.com/Chakiss/one-event/actions
