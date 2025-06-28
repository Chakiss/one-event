# 🚀 Quick Start Guide: การใช้งานรูปภาพ

## 📋 สรุปสั้นๆ

### 1. รูปภาพพื้นฐาน
```tsx
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Description" 
  width={100} 
  height={100}
/>
```

### 2. ใช้ Enhanced Component
```tsx
import { EnhancedImage } from '@/components/common/ImageComponents';

<EnhancedImage
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  className="rounded-lg"
/>
```

### 3. User Avatar
```tsx
import { UserAvatar } from '@/components/common/ImageComponents';

<UserAvatar 
  user={{ name: 'John Doe', avatar: '/avatar.jpg' }}
  size="md"
/>
```

### 4. Logo Component
```tsx
import { Logo } from '@/components/common/ImageComponents';

<Logo size="lg" />
```

## 📁 โครงสร้างไฟล์

```
public/
├── logo.png           ← โลโก้หลัก
├── images/
│   ├── placeholder.png
│   ├── events/
│   └── avatars/
```

## 🔧 Configuration

### next.config.ts
```typescript
images: {
  domains: [
    'images.unsplash.com',
    'your-api-domain.com'
  ],
}
```

## 🎯 ตัวอย่างการใช้งานจริง

ดูตัวอย่างทั้งหมดได้ที่:
- 📄 `/image-examples` - หน้า demo
- 📚 `IMAGE-EXAMPLES.md` - คู่มือเต็ม
- 🔧 `src/components/common/ImageComponents.tsx` - Components พร้อมใช้

## 💡 Tips สำคัญ

1. **ใช้ width/height** สำหรับรูปขนาดคงที่
2. **ใช้ fill** สำหรับรูปที่ต้องการเต็ม container
3. **ใช้ priority** สำหรับรูปสำคัญ (above the fold)
4. **ใช้ alt text** ที่มีความหมายเสมอ
5. **Config domains** สำหรับ external images
