# 📧 Email Service Setup Guide for OneEvent Production

## 🔍 **สถานะปัจจุบัน**

❌ **Email service ยังไม่พร้อมใช้งาน**
- ตอนนี้รันใน **simulation mode** 
- ข้อความจาก logs: `"Email configuration is incomplete. Email sending will be simulated."`

## 📋 **Environment Variables ที่ต้องตั้งค่า**

Email service ต้องการ environment variables ต่อไปนี้:

```bash
EMAIL_HOST=smtp.gmail.com          # SMTP server
EMAIL_PORT=587                     # SMTP port  
EMAIL_USER=your-email@gmail.com    # Email username
EMAIL_PASS=your-app-password       # Email password/app password
EMAIL_SECURE=false                 # true สำหรับ port 465, false สำหรับ port อื่น
FRONTEND_URL=https://one-event-frontend-test-zwxzaz56uq-as.a.run.app
```

## 🛠️ **วิธีตั้งค่า Email Service**

### **Option 1: Gmail SMTP (แนะนำสำหรับเริ่มต้น)**

#### Step 1: สร้าง Gmail App Password
1. ไปที่ Google Account settings
2. Security → 2-Step Verification (ต้องเปิดก่อน)
3. App passwords → สร้าง password ใหม่ สำหรับ "Mail"
4. เก็บ password ที่ได้มา

#### Step 2: เพิ่ม Secrets ใน GCP
```bash
# เพิ่ม email configuration secrets
echo "smtp.gmail.com" | gcloud secrets create one-event-email-host-prod --data-file=-
echo "587" | gcloud secrets create one-event-email-port-prod --data-file=-
echo "your-email@gmail.com" | gcloud secrets create one-event-email-user-prod --data-file=-
echo "your-app-password" | gcloud secrets create one-event-email-pass-prod --data-file=-
echo "false" | gcloud secrets create one-event-email-secure-prod --data-file=-
echo "https://one-event-frontend-test-zwxzaz56uq-as.a.run.app" | gcloud secrets create one-event-frontend-url-prod --data-file=-
```

#### Step 3: อัพเดท Cloud Run Deployment
```bash
gcloud run deploy one-event-api-test \
  --image=asia-southeast1-docker.pkg.dev/one-event-production/one-event-repo/backend:latest \
  --region=asia-southeast1 \
  --add-cloudsql-instances=one-event-production:asia-southeast1:one-event-db \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=one-event-db-url-prod:latest,JWT_SECRET=one-event-jwt-secret-prod:latest,EMAIL_HOST=one-event-email-host-prod:latest,EMAIL_PORT=one-event-email-port-prod:latest,EMAIL_USER=one-event-email-user-prod:latest,EMAIL_PASS=one-event-email-pass-prod:latest,EMAIL_SECURE=one-event-email-secure-prod:latest,FRONTEND_URL=one-event-frontend-url-prod:latest" \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --port=8080
```

### **Option 2: SendGrid (แนะนำสำหรับ Production)**

#### Step 1: สร้าง SendGrid Account
1. สมัคร SendGrid account
2. สร้าง API Key
3. Verify sender identity

#### Step 2: ตั้งค่า SendGrid Configuration
```bash
echo "smtp.sendgrid.net" | gcloud secrets create one-event-email-host-prod --data-file=-
echo "587" | gcloud secrets create one-event-email-port-prod --data-file=-
echo "apikey" | gcloud secrets create one-event-email-user-prod --data-file=-
echo "YOUR_SENDGRID_API_KEY" | gcloud secrets create one-event-email-pass-prod --data-file=-
echo "false" | gcloud secrets create one-event-email-secure-prod --data-file=-
```

## 🔧 **Quick Setup Commands (Gmail)**

**ให้เปลี่ยน `your-email@gmail.com` และ `your-app-password`:**

```bash
# 1. สร้าง secrets
echo "smtp.gmail.com" | gcloud secrets create one-event-email-host-prod --data-file=-
echo "587" | gcloud secrets create one-event-email-port-prod --data-file=-
echo "your-email@gmail.com" | gcloud secrets create one-event-email-user-prod --data-file=-
echo "your-app-password" | gcloud secrets create one-event-email-pass-prod --data-file=-
echo "false" | gcloud secrets create one-event-email-secure-prod --data-file=-
echo "https://one-event-frontend-test-zwxzaz56uq-as.a.run.app" | gcloud secrets create one-event-frontend-url-prod --data-file=-

# 2. อัพเดท Cloud Run
gcloud run deploy one-event-api-test \
  --image=asia-southeast1-docker.pkg.dev/one-event-production/one-event-repo/backend:latest \
  --region=asia-southeast1 \
  --add-cloudsql-instances=one-event-production:asia-southeast1:one-event-db \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=one-event-db-url-prod:latest,JWT_SECRET=one-event-jwt-secret-prod:latest,EMAIL_HOST=one-event-email-host-prod:latest,EMAIL_PORT=one-event-email-port-prod:latest,EMAIL_USER=one-event-email-user-prod:latest,EMAIL_PASS=one-event-email-pass-prod:latest,EMAIL_SECURE=one-event-email-secure-prod:latest,FRONTEND_URL=one-event-frontend-url-prod:latest" \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --timeout=300 \
  --port=8080
```

## ✅ **การทดสอบหลังตั้งค่า**

หลังจากตั้งค่าเสร็จ ให้ตรวจสอบ:

```bash
# 1. ตรวจสอบ health check
curl https://one-event-api-test-zwxzaz56uq-as.a.run.app/health | jq '.services.email'

# 2. ตรวจสอบ logs
gcloud run services logs read one-event-api-test --region=asia-southeast1 --limit=10

# คาดหวัง message: "Email transporter created successfully"
# แทนที่จะเป็น: "Email configuration is incomplete"
```

## 🎯 **Functions ที่จะใช้งานได้หลังตั้งค่า**

- ✅ Email verification เมื่อสมัครสมาชิก
- ✅ Password reset emails
- ✅ Event registration confirmations
- ✅ Event notifications และ reminders

## ⚠️ **หมายเหตุสำคัญ**

1. **Gmail App Password**: ต้องเปิด 2-Step Verification ก่อน
2. **Security**: อย่าเผยแพร่ email passwords ในโค้ด
3. **Rate Limits**: Gmail มี sending limits (500 emails/day สำหรับ free)
4. **Production**: ควรใช้ SendGrid หรือ AWS SES สำหรับ production จริง

---

**ต้องการให้ผมช่วยตั้งค่า email service เลยไหม?**
