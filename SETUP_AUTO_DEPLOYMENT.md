# ✅ OneEvent Auto-Deployment - SETUP COMPLETE!

> **🎉 SUCCESS:** Auto-deployment has been successfully set up and is now operational!  
> **Live URL:** https://one-event-api-test-zwxzaz56uq-as.a.run.app  
> **Status:** All systems operational ✅

---

# 🚀 OneEvent - การตั้งค่า Auto-Deployment ขึ้น GCP

คู่มือละเอียดสำหรับการตั้งค่าให้ push code แล้วขึ้น GCP อัตโนมัติ

## 📝 ข้อกำหนดเบื้องต้น

- **macOS** (คู่มือนี้เขียนสำหรับ macOS)
- **Google Cloud Platform Account** พร้อม billing enabled
- **GitHub Account** ที่สามารถเข้าถึง repo นี้ได้
- **Internet connection** สำหรับดาวน์โหลดเครื่องมือ

---

## 🛠️ ขั้นตอนที่ 1: ติดตั้งเครื่องมือที่จำเป็น

### วิธีที่ 1: ใช้ Auto-Install Script (แนะนำ)

```bash
# รัน script ติดตั้งอัตโนมัติ
./scripts/install-tools-macos.sh

# หลังจากติดตั้งเสร็จ restart terminal หรือรัน
source ~/.zshrc
```

### วิธีที่ 2: ติดตั้งด้วยตนเอง

#### ติดตั้ง Homebrew (ถ้ายังไม่มี)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### ติดตั้ง Google Cloud CLI
```bash
# Download และติดตั้ง
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-458.0.1-darwin-x86_64.tar.gz
tar -xf google-cloud-cli-458.0.1-darwin-x86_64.tar.gz
./google-cloud-sdk/install.sh

# เพิ่มใน PATH
echo 'export PATH="$HOME/google-cloud-sdk/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### ติดตั้ง GitHub CLI
```bash
brew install gh
```

#### ติดตั้ง Docker Desktop
1. ไปที่ https://www.docker.com/products/docker-desktop/
2. ดาวน์โหลดและติดตั้ง Docker Desktop for Mac
3. เปิด Docker Desktop และรอให้เริ่มต้นเสร็จ

---

## 🔐 ขั้นตอนที่ 2: Authentication

### Login ใน Google Cloud
```bash
# Login
gcloud auth login

# ตรวจสอบ
gcloud auth list
```

### Login ใน GitHub
```bash
# Login
gh auth login

# เลือก:
# - GitHub.com
# - HTTPS
# - Login with a web browser

# ตรวจสอบ
gh auth status
```

---

## ☁️ ขั้นตอนที่ 3: ตั้งค่า GCP Project

### รัน Auto-Setup Script
```bash
# รัน script ตั้งค่า GCP อัตโนมัติ
./scripts/setup-gcp-auto-deploy.sh
```

Script นี้จะทำให้คุณ:
- ✅ สร้าง GCP Project: `one-event-production`
- ✅ เปิด APIs ที่จำเป็น (Cloud Run, Artifact Registry, etc.)
- ✅ สร้าง Artifact Registry สำหรับเก็บ Docker images
- ✅ สร้าง Service Account สำหรับ GitHub Actions
- ✅ สร้าง Cloud SQL Database (PostgreSQL)
- ✅ ตั้งค่า Secret Manager สำหรับเก็บ passwords
- ✅ ตั้งค่า GitHub Secrets อัตโนมัติ

### หากต้องการตั้งค่าด้วยตนเอง

<details>
<summary>คลิกเพื่อดูขั้นตอนแบบ Manual</summary>

#### สร้าง GCP Project
```bash
gcloud projects create one-event-production --name="OneEvent Production"
gcloud config set project one-event-production
```

#### เปิด APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable sql-component.googleapis.com
```

#### สร้าง Artifact Registry
```bash
gcloud artifacts repositories create one-event-repo \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="OneEvent Docker images"
```

#### สร้าง Service Account
```bash
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding one-event-production \
  --member="serviceAccount:github-actions-sa@one-event-production.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding one-event-production \
  --member="serviceAccount:github-actions-sa@one-event-production.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding one-event-production \
  --member="serviceAccount:github-actions-sa@one-event-production.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"
```

#### สร้าง Service Account Key
```bash
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions-sa@one-event-production.iam.gserviceaccount.com
```

#### ตั้งค่า GitHub Secrets
```bash
gh secret set GCP_SA_KEY --body-file=key.json --repo=Chakiss/one-event
gh secret set GCP_PROJECT_ID --body="one-event-production" --repo=Chakiss/one-event
gh secret set GCP_REGION --body="asia-southeast1" --repo=Chakiss/one-event
```

</details>

---

## 🗄️ ขั้นตอนที่ 4: ตั้งค่า Database

### สร้าง Cloud SQL Instance
```bash
gcloud sql instances create one-event-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=asia-southeast1 \
  --storage-type=SSD \
  --storage-size=10GB
```

### สร้าง Databases
```bash
gcloud sql databases create one_event_prod --instance=one-event-db
gcloud sql databases create one_event_dev --instance=one-event-db
```

### ตั้งค่า Database Password
```bash
# ตั้งค่า postgres password
gcloud sql users set-password postgres \
  --instance=one-event-db \
  --password=YOUR_SECURE_PASSWORD
```

### อัปเดต Database URLs ใน Secret Manager
```bash
# Get database IP
DB_IP=$(gcloud sql instances describe one-event-db --format="value(ipAddresses[0].ipAddress)")

# Create secrets
echo "postgresql://postgres:YOUR_PASSWORD@$DB_IP:5432/one_event_prod" | \
  gcloud secrets create one-event-db-url-prod --data-file=-

echo "postgresql://postgres:YOUR_PASSWORD@$DB_IP:5432/one_event_dev" | \
  gcloud secrets create one-event-db-url-dev --data-file=-

# Create JWT secret
openssl rand -base64 32 | gcloud secrets create one-event-jwt-secret-prod --data-file=-
openssl rand -base64 32 | gcloud secrets create one-event-jwt-secret-dev --data-file=-
```

---

## 🚀 ขั้นตอนที่ 5: ทดสอบ Auto-Deployment

### Push ไป Production
```bash
git add .
git commit -m "Test auto-deployment"
git push origin main
```

### Push ไป Development
```bash
git checkout -b develop
git push origin develop
```

### ดู Status
```bash
# ดู GitHub Actions
gh run list --repo=Chakiss/one-event

# ดู Cloud Run services
gcloud run services list --region=asia-southeast1
```

---

## 🌐 URLs หลัง Deploy สำเร็จ

### Production Environment
- **Frontend**: https://one-event-web-prod-[hash]-as.a.run.app
- **Backend**: https://one-event-api-prod-[hash]-as.a.run.app

### Development Environment
- **Frontend**: https://one-event-web-dev-[hash]-as.a.run.app
- **Backend**: https://one-event-api-dev-[hash]-as.a.run.app

---

## 🔍 การตรวจสอบและแก้ไขปัญหา

### ตรวจสอบ Deployment Status
```bash
# GitHub Actions logs
gh run view --repo=Chakiss/one-event

# Cloud Run service status
gcloud run services describe one-event-api-prod --region=asia-southeast1

# Cloud Run logs
gcloud logs read --log-filter="resource.type=cloud_run_revision"
```

### ปัญหาที่พบบ่อย

#### 1. Permission Denied
```bash
# ตรวจสอบ service account permissions
gcloud projects get-iam-policy one-event-production
```

#### 2. Docker Build Failed
```bash
# ตรวจสอบ Dockerfile
docker build -t test-image ./one-event-be
```

#### 3. Database Connection Failed
```bash
# ตรวจสอบ database status
gcloud sql instances describe one-event-db

# ตรวจสอบ secrets
gcloud secrets versions access latest --secret=one-event-db-url-prod
```

---

## 💡 Tips และ Best Practices

1. **ใช้ develop branch** สำหรับ testing ก่อน deploy production
2. **ดู logs** ใน GitHub Actions เมื่อมีปัญหา
3. **ตั้งค่า notifications** ใน GitHub เพื่อรับแจ้งเตือนเมื่อ deploy สำเร็จ/ล้มเหลว
4. **Monitor costs** ใน GCP Console
5. **Backup database** เป็นประจำ

---

## 🆘 การขอความช่วยเหลือ

หากมีปัญหาในการตั้งค่า:

1. ตรวจสอบ logs ใน GitHub Actions
2. ตรวจสอบ GCP Console
3. รัน script troubleshooting:
   ```bash
   ./scripts/troubleshoot.sh
   ```

---

## ✅ Checklist สำหรับการตั้งค่า

- [ ] ติดตั้ง gcloud CLI
- [ ] ติดตั้ง GitHub CLI  
- [ ] ติดตั้ง Docker Desktop
- [ ] Login gcloud และ GitHub
- [ ] รัน setup-gcp-auto-deploy.sh
- [ ] ตั้งค่า database password
- [ ] อัปเดต database URLs ใน Secret Manager
- [ ] ทดสอบ push code
- [ ] ตรวจสอบ deployment ใน GCP Console

เมื่อทำครบทุกขั้นตอนแล้ว คุณสามารถ push code และได้ auto-deployment ขึ้น GCP ได้เลย! 🎉
