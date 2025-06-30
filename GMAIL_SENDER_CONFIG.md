# 📧 Gmail SMTP Sender Configuration

## 🔍 **ปัญหา: Sender Address Override**

เมื่อใช้ Gmail SMTP, ลูกค้าจะเห็น:

### ❌ **สิ่งที่เราต้องการ:**
```
From: OneEvent <noreply@oneevent.com>
```

### ⚠️ **สิ่งที่ลูกค้าจะเห็นจริง:**
```
From: your-gmail@gmail.com
หรือ: Your Name <your-gmail@gmail.com>
```

## ✅ **วิธีแก้ไข**

### **Option A: ปรับ Display Name ใน Gmail**

1. **ตั้งค่าใน Gmail Settings:**
   - Gmail → Settings → Accounts and Import
   - "Send mail as" → Add another email address
   - Name: `OneEvent Support`
   - Email: `your-gmail@gmail.com` (ต้องเป็น Gmail เดิม)

2. **อัพเดท EMAIL_FROM:**
   ```bash
   echo "OneEvent Support <your-gmail@gmail.com>" | gcloud secrets create one-event-email-from-prod --data-file=-
   ```

### **Option B: ใช้ Gmail Professional (Google Workspace)**

1. **Google Workspace:**
   - มี custom domain: `admin@yourdomain.com`
   - ลูกค้าเห็น: `OneEvent <admin@yourdomain.com>`

2. **ค่าใช้จ่าย:** ~$6/เดือน/user

### **Option C: SendGrid (แนะนำที่สุด)**

1. **ข้อดี:**
   - Custom sender: `OneEvent <noreply@yourdomain.com>`
   - Professional appearance
   - Better deliverability
   - Detailed analytics

2. **ค่าใช้จ่าย:** 
   - Free: 100 emails/day
   - Essentials: $14.95/month (50K emails)

## 🚀 **Quick Fix สำหรับ Gmail**

**ถ้าต้องการใช้ Gmail ต่อ แต่ให้ดูเป็นมืออาชีพ:**

```bash
# 1. สร้าง Gmail account ใหม่แบบ professional:
# เช่น: oneevent.platform@gmail.com
# หรือ: support.oneevent@gmail.com

# 2. อัพเดท EMAIL_FROM configuration:
echo "OneEvent Platform <oneevent.platform@gmail.com>" | gcloud secrets create one-event-email-from-prod --data-file=-

# 3. อัพเดท Cloud Run deployment ให้รวม EMAIL_FROM:
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

## 📋 **สรุปแต่ละ Option**

| Option | Sender ที่ลูกค้าเห็น | Professional Level | Cost |
|--------|---------------------|-------------------|------|
| **Gmail Personal** | `your-name@gmail.com` | ⭐⭐ | Free |
| **Gmail + Custom Name** | `OneEvent <your-name@gmail.com>` | ⭐⭐⭐ | Free |
| **Google Workspace** | `OneEvent <admin@yourdomain.com>` | ⭐⭐⭐⭐ | $6/month |
| **SendGrid** | `OneEvent <noreply@yourdomain.com>` | ⭐⭐⭐⭐⭐ | Free-$15/month |

## 💡 **คำแนะนำ**

**สำหรับเริ่มต้น:** 
- ใช้ Gmail + ตั้งชื่อ professional เช่น `oneevent.platform@gmail.com`
- ลูกค้าจะเห็น: `OneEvent Platform <oneevent.platform@gmail.com>`

**สำหรับ Production จริง:**
- ใช้ SendGrid + custom domain
- ลูกค้าจะเห็น: `OneEvent <support@yourdomain.com>`

---

**ต้องการให้ตั้งค่าแบบไหนครับ?**
