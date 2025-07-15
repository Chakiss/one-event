# 🗑️ คู่มือลบ GCP Resources จาก Console

## 📋 สิ่งที่ต้องลบ

### 1. Cloud Run Services
1. ไป [Cloud Run Console](https://console.cloud.google.com/run)
2. เลือก project: `one-event-production`
3. ลบ services:
   - `one-event-api`
   - `one-event-api-prod`
   - `one-event-api-dev`
   - `one-event-frontend`
   - `one-event-frontend-prod`
   - `one-event-frontend-dev`

### 2. Cloud SQL Database
1. ไป [Cloud SQL Console](https://console.cloud.google.com/sql)
2. ลบ instance: `one-event-db`
3. **⚠️ ระวัง**: Backup ข้อมูลก่อนลบ!

### 3. Artifact Registry
1. ไป [Artifact Registry Console](https://console.cloud.google.com/artifacts)
2. ลบ repository: `one-event-repo`
3. ลบ Docker images ทั้งหมด

### 4. Load Balancer & Networking
1. ไป [Load Balancing Console](https://console.cloud.google.com/net-services/loadbalancing)
2. ลบ Load Balancer และ backend services
3. ลบ URL maps, target proxies
4. ไป [VPC Console](https://console.cloud.google.com/networking/networks/list)
5. ลบ custom VPC networks (ถ้ามี)

### 5. Secret Manager
1. ไป [Secret Manager Console](https://console.cloud.google.com/security/secret-manager)
2. ลบ secrets:
   - `one-event-db-url-prod`
   - `one-event-jwt-secret-prod`
   - อื่นๆ ที่เกี่ยวข้อง

### 6. IAM & Service Accounts
1. ไป [IAM Console](https://console.cloud.google.com/iam-admin/iam)
2. ลบ service accounts ที่สร้างสำหรับ OneEvent
3. ไป [Service Accounts Console](https://console.cloud.google.com/iam-admin/serviceaccounts)
4. ลบ service accounts ที่ไม่ใช้

### 7. Cloud Storage (ถ้ามี)
1. ไป [Cloud Storage Console](https://console.cloud.google.com/storage)
2. ลบ buckets ที่เกี่ยวข้อง

### 8. Monitoring & Logging
1. ไป [Cloud Monitoring Console](https://console.cloud.google.com/monitoring)
2. ลบ dashboards และ alerting policies
3. ไป [Cloud Logging Console](https://console.cloud.google.com/logs)
4. ลบ log sinks (ถ้ามี custom sinks)

## 🚨 ขั้นตอนสำคัญ

### ก่อนลบ
```bash
# 1. Export database
gcloud sql export sql one-event-db gs://your-backup-bucket/onevent-backup.sql

# 2. Download backup
gsutil cp gs://your-backup-bucket/onevent-backup.sql ./backup/

# 3. Export environment variables
gcloud run services describe one-event-api --region=asia-southeast1 --format="export" > onevent-config-backup.yaml
```

### หลังลบ
1. ตรวจสอบ billing dashboard
2. ปิด project (ถ้าไม่ใช้แล้ว)
3. Remove project จาก organization (ถ้าจำเป็น)

## 💰 ประหยัดค่าใช้จ่าย

**Before**: ~$70/เดือน (GCP)  
**After**: $0/เดือน (GCP ปิดแล้ว) + $5-15/เดือน (Railway) = **ประหยัด 80%!**

## 🔄 Alternative: Suspend แทน Delete

ถ้าไม่แน่ใจ อาจ suspend services แทน:

```bash
# Suspend Cloud Run services
gcloud run services update one-event-api --region=asia-southeast1 --min-instances=0 --max-instances=0

# Stop Cloud SQL instance
gcloud sql instances patch one-event-db --activation-policy=NEVER
```

## ✅ Checklist การลบ

- [ ] Export database backup
- [ ] Download environment configs  
- [ ] ลบ Cloud Run services
- [ ] ลบ Cloud SQL database
- [ ] ลบ Artifact Registry
- [ ] ลบ Load Balancer
- [ ] ลบ Secret Manager secrets
- [ ] ลบ Service Accounts
- [ ] ลบ Cloud Storage buckets
- [ ] ตรวจสอบ billing dashboard
- [ ] ปิด project (optional)

## 📞 Emergency Restore

ถ้าต้องการกลับมาใช้ GCP:

1. สร้าง Cloud SQL instance ใหม่
2. Import database จาก backup
3. Deploy จาก Railway กลับไป GCP
4. Update DNS records

**Estimated restore time**: 2-4 ชั่วโมง

---

**💡 Tip**: ใช้ script `./cleanup-gcp.sh` เพื่อลบ resources แบบ automated
