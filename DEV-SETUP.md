# OneEvent Development Setup

## Port Configuration

### Fixed Ports
- **Frontend**: http://localhost:3000 (Next.js)
- **Backend**: http://localhost:8000 (NestJS)
- **API Documentation**: http://localhost:8000/api

### การเริ่มต้น Development Servers

#### วิธีที่ 1: ใช้ Startup Script (แนะนำ)
```bash
# จาก root directory
./start-dev.sh
```

#### วิธีที่ 2: เริ่มแยกกัน
```bash
# Terminal 1 - Backend
cd one-event-be
npm run start:dev

# Terminal 2 - Frontend  
cd one-event-fe
npm run dev
```

### การแก้ไขปัญหา Port

หาก port 3000 ถูกใช้งาน:
```bash
# ค้นหา process ที่ใช้ port 3000
lsof -i :3000

# หยุด process
kill -9 <PID>

# หรือใช้คำสั่งนี้เพื่อหยุดทุก process ที่ใช้ port 3000
lsof -ti:3000 | xargs kill -9
```

### Environment Variables

#### Frontend (.env.local)
```
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend
Backend จะใช้ port 8000 เป็นค่าเริ่มต้น

### CORS Configuration

Backend ได้รับการกำหนดค่าให้รองรับ:
- http://localhost:3000 (หลัก)
- http://localhost:3001, 3002, 3005 (สำรอง)
- http://127.0.0.1:3000 และ ports อื่นๆ

### การตรวจสอบสถานะ

```bash
# ตรวจสอบ Backend Health
curl http://localhost:8000/health

# ตรวจสอบ Frontend
curl http://localhost:3000
```

### หมายเหตุ

- Frontend จะใช้ port 3000 ตายตัว (ไม่เปลี่ยนแปลงอัติโนมัติ)
- หาก port 3000 ถูกใช้งาน server จะไม่เริ่มต้น และต้องหยุด process ที่ใช้ port นั้นก่อน
- ใช้ startup script เพื่อความสะดวกในการเริ่ม development environment
