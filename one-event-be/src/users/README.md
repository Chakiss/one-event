# Users Module

## Overview
โมดูลสำหรับจัดการข้อมูลผู้ใช้ในระบบ One Event พร้อมการผูกกับ PostgreSQL Database

## Entity Structure
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // เข้ารหัสด้วย bcrypt อัตโนมัติ

  @Column({ type: 'enum', enum: ['admin', 'guest'], default: 'guest' })
  role: 'admin' | 'guest';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Features ✅

### 🔐 Security
- **Password Hashing**: ใช้ bcrypt เข้ารหัส password อัตโนมัติ
- **Password Validation**: method สำหรับตรวจสอบ password
- **Data Validation**: ใช้ class-validator ตรวจสอบข้อมูล

### 🗃️ Database
- **TypeORM Integration**: เชื่อมต่อกับ PostgreSQL
- **UUID Primary Keys**: ใช้ UUID แทน auto-increment
- **Timestamps**: บันทึกเวลาสร้างและแก้ไขอัตโนมัติ
- **Unique Email**: ป้องกัน email ซ้ำ

### 🌐 API Endpoints
- `GET /users` - ดึงข้อมูลผู้ใช้ทั้งหมด (ไม่มี password)
- `GET /users/:id` - ดึงข้อมูลผู้ใช้ตาม UUID
- `POST /users` - สร้างผู้ใช้ใหม่
- `PATCH /users/:id` - อัปเดตข้อมูลผู้ใช้
- `DELETE /users/:id` - ลบผู้ใช้

### 🔍 Validation Rules
```typescript
// CreateUserDto
email: string;        // ต้องเป็น email format
password: string;     // ต้องมีอย่างน้อย 6 ตัวอักษร
role: 'admin' | 'guest'; // ต้องเป็นค่าใดค่าหนึ่ง
```

## API Examples

### สร้างผู้ใช้ใหม่
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "guest"
  }'
```

### ดูผู้ใช้ทั้งหมด
```bash
curl http://localhost:3000/users
```

### อัปเดตผู้ใช้
```bash
curl -X PATCH http://localhost:3000/users/:uuid \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

## Error Handling
- **404 Not Found**: เมื่อไม่พบผู้ใช้
- **409 Conflict**: เมื่อ email ซ้ำ
- **400 Bad Request**: เมื่อข้อมูลไม่ถูกต้อง

## Database Integration ✅
- ✅ TypeORM entities และ repositories
- ✅ Database configuration
- ✅ Password hashing hooks
- ✅ Validation pipes
- ✅ Error handling
- ✅ UUID primary keys
- ✅ Timestamps tracking

## Next Steps: Authentication & Authorization 🚀
1. สร้าง JWT authentication service
2. สร้าง login/logout endpoints
3. สร้าง guards สำหรับป้องกันการเข้าถึง
4. สร้าง roles-based authorization
