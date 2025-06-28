# OneEvent Monorepo Structure

## 📁 Recommended Project Structure

```
one-event/
├── 📂 apps/
│   ├── 📂 backend/          # NestJS API (ย้ายจาก one-event-be)
│   │   ├── src/
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── ...
│   └── 📂 frontend/         # Next.js App (ย้ายจาก one-event-fe)
│       ├── src/
│       ├── package.json
│       ├── Dockerfile
│       └── ...
├── 📂 packages/             # Shared packages
│   ├── 📂 shared-types/     # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── api.ts
│   │   │   ├── events.ts
│   │   │   └── users.ts
│   │   └── package.json
│   ├── 📂 ui-components/    # Shared UI components
│   │   ├── src/
│   │   └── package.json
│   └── 📂 utils/           # Shared utilities
│       ├── src/
│       └── package.json
├── 📂 infrastructure/       # Infrastructure as Code
│   ├── 📂 terraform/
│   ├── 📂 kubernetes/
│   └── 📂 docker/
├── 📂 docs/                # Documentation
├── 📂 scripts/             # Build & deployment scripts
├── 📂 .github/
│   └── 📂 workflows/       # CI/CD workflows
├── package.json            # Root package.json (workspace)
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🔧 Workspace Configuration

### Root package.json (Workspace Manager)
```json
{
  "name": "one-event",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "clean": "rm -rf node_modules apps/*/node_modules packages/*/node_modules"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "concurrently": "^8.0.0",
    "typescript": "^5.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

## 🚀 Benefits of This Structure

### 1. Shared Types
- API interfaces ใช้ร่วมกันระหว่าง FE/BE
- ลด type mismatch errors
- Auto-completion ดีขึ้น

### 2. Efficient CI/CD
- Build แค่ parts ที่เปลี่ยน
- Cache dependencies ได้ดี
- Deploy independently แต่ coordinate ได้

### 3. Developer Experience
- Single command setup: `npm install`
- Shared linting และ formatting rules
- Unified testing strategy

## 📦 Migration Strategy

### Phase 1: Repository Setup
1. สร้าง monorepo structure
2. ย้าย existing code
3. ตั้งค่า workspace

### Phase 2: Extract Shared Code
1. สร้าง shared-types package
2. ย้าย common interfaces
3. Update imports

### Phase 3: CI/CD Update
1. อัพเดท GitHub Actions
2. ปรับ build paths
3. Configure deployments
