# 🚀 SendGrid Setup Instructions for OneEvent

## 📋 **Step-by-Step Setup**

### **Step 1: Create SendGrid Account** ⏳
1. ไปที่: https://signup.sendgrid.com/
2. สมัครด้วย email ของคุณ
3. เลือก **Free Plan** (ฟรี 100 emails/วัน)
4. Verify email address
5. Complete account setup

### **Step 2: Create API Key** (หลังจากสมัครเสร็จ)
1. เข้า SendGrid Console
2. Settings → API Keys
3. Create API Key
4. Name: `OneEvent Production`
5. Permissions: **Full Access** (หรือ Mail Send อย่างน้อย)
6. **บันทึก API Key** (จะแสดงแค่ครั้งเดียว!)

### **Step 3: Verify Sender Identity**
1. Settings → Sender Authentication
2. Single Sender Verification
3. เพิ่ม email address ที่จะใช้เป็น sender
4. ตัวอย่าง: `support@yourdomain.com` หรือ email ของคุณ
5. Verify email

### **Step 4: Configure Production Environment**

หลังจากได้ API Key แล้ว เราจะรันคำสั่งเหล่านี้:

```bash
# สร้าง secrets สำหรับ SendGrid
echo "smtp.sendgrid.net" | gcloud secrets create one-event-email-host-prod --data-file=-
echo "587" | gcloud secrets create one-event-email-port-prod --data-file=-
echo "apikey" | gcloud secrets create one-event-email-user-prod --data-file=-
echo "YOUR_SENDGRID_API_KEY" | gcloud secrets create one-event-email-pass-prod --data-file=-
echo "false" | gcloud secrets create one-event-email-secure-prod --data-file=-
echo "OneEvent <verified-sender@yourdomain.com>" | gcloud secrets create one-event-email-from-prod --data-file=-
echo "https://one-event-frontend-test-zwxzaz56uq-as.a.run.app" | gcloud secrets create one-event-frontend-url-prod --data-file=-

# อัพเดท Cloud Run deployment
gcloud run deploy one-event-api-test \
  --image=asia-southeast1-docker.pkg.dev/one-event-production/one-event-repo/backend:latest \
  --region=asia-southeast1 \
  --add-cloudsql-instances=one-event-production:asia-southeast1:one-event-db \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=one-event-db-url-prod:latest,JWT_SECRET=one-event-jwt-secret-prod:latest,EMAIL_HOST=one-event-email-host-prod:latest,EMAIL_PORT=one-event-email-port-prod:latest,EMAIL_USER=one-event-email-user-prod:latest,EMAIL_PASS=one-event-email-pass-prod:latest,EMAIL_SECURE=one-event-email-secure-prod:latest,FRONTEND_URL=one-event-frontend-url-prod:latest,EMAIL_FROM=one-event-email-from-prod:latest" \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --port=8080
```

### **Step 5: Test Email Service**

หลังจากตั้งค่าเสร็จ:

```bash
# ตรวจสอบ health check
curl https://one-event-api-test-zwxzaz56uq-as.a.run.app/health | jq '.services.email'

# ตรวจสอบ logs
gcloud run services logs read one-event-api-test --region=asia-southeast1 --limit=5
```

คาดหวัง message: `"Email transporter created successfully"`

---

## 🎯 **Current Status**

- ✅ SendGrid account สร้างแล้วหรือยัง?
- ⏳ API Key รอสร้าง
- ⏳ Sender verification รอทำ
- ⏳ Production configuration รอตั้งค่า

## 💡 **Next Steps**

**กรุณาแจ้งเมื่อ:**
1. สมัคร SendGrid account เสร็จแล้ว
2. ได้ API Key แล้ว
3. Verify sender แล้ว

**แล้วผมจะช่วยตั้งค่า production environment ให้เลย!**

---

**สถานะ: 🟡 รอการสมัคร SendGrid account**
