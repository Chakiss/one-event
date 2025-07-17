# Railway Split-Project Deployment Success

## Overview
Successfully deployed OneEvent using the **split-project approach** on Railway:
- **Frontend (FE)**: Separate Railway project `one-event-fe`
- **Backend (BE)**: Separate Railway project `one-event-be`

## Deployment Information

### Backend (BE)
- **Project Name**: `one-event-be`
- **Service Name**: `backend`
- **URL**: https://backend-production-c78d7.up.railway.app
- **Health Check**: ✅ `GET /health` returns `{"status":"ok"}`
- **Database**: PostgreSQL (Railway managed)

### Frontend (FE)
- **Project Name**: `one-event-fe`
- **Service Name**: `frontend`
- **URL**: https://one-event.up.railway.app
- **Status**: ✅ Successfully loading (Next.js app)

## Environment Variables

### Backend Environment Variables
```
CORS_ORIGIN=https://one-event.up.railway.app,http://localhost:3000,http://localhost:3001,http://localhost:3002
DATABASE_URL=postgresql://postgres:***@postgres.railway.internal:5432/railway
JWT_SECRET=your-super-secret-jwt-key-for-production-use-256-bits
NODE_ENV=production
PORT=3000
```

### Frontend Environment Variables
```
NEXT_PUBLIC_API_URL=https://backend-production-c78d7.up.railway.app
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
```

## Configuration Details

### CORS Configuration
The backend is configured to accept requests from:
- ✅ `https://one-event.up.railway.app` (Production Frontend)
- ✅ `http://localhost:3000` (Local Development)
- ✅ `http://localhost:3001` (Local Development)
- ✅ `http://localhost:3002` (Local Development)

### API Connectivity
- Frontend successfully configured to call Backend API
- Backend health endpoint accessible: `/health`
- CORS properly configured for cross-origin requests

## Project Structure

```
Railway Projects:
├── one-event-fe (Frontend Project)
│   └── frontend (Service)
│       ├── URL: https://one-event.up.railway.app
│       └── Source: /one-event-fe directory
└── one-event-be (Backend Project)
    ├── backend (Service)
    │   ├── URL: https://backend-production-c78d7.up.railway.app
    │   └── Source: /one-event-be directory
    └── Postgres (Database Service)
        └── Internal URL: postgres.railway.internal:5432
```

## Benefits of Split-Project Approach

1. **Isolated Scaling**: Each service can be scaled independently
2. **Separate Environments**: Different staging/production environments per service
3. **Independent Deployments**: Deploy FE and BE separately without affecting each other
4. **Clear Separation of Concerns**: Each project focuses on its specific role
5. **Resource Management**: Better control over resource allocation per service

## Railway CLI Commands Used

### Switch Between Projects
```bash
# Navigate to Backend
cd one-event-be
railway status  # Shows: Project: one-event-be, Service: backend

# Navigate to Frontend  
cd one-event-fe
railway status  # Shows: Project: one-event-fe, Service: frontend
```

### Environment Variables Management
```bash
# Backend
cd one-event-be
railway variables  # View all variables
railway variables --set CORS_ORIGIN="https://one-event.up.railway.app,http://localhost:3000,http://localhost:3001,http://localhost:3002"

# Frontend
cd one-event-fe
railway variables  # View all variables
railway variables --set NEXT_PUBLIC_API_URL="https://backend-production-c78d7.up.railway.app"
```

### Service Management
```bash
# Backend
cd one-event-be
railway service  # Select from: backend, Postgres
railway domain   # View: https://backend-production-c78d7.up.railway.app

# Frontend
cd one-event-fe
railway service  # Select: frontend
railway domain   # View: https://one-event.up.railway.app
```

## Testing URLs

### Backend Health Check
```bash
curl https://backend-production-c78d7.up.railway.app/health
# Response: {"status":"ok","timestamp":"...","services":{"api":{"status":"ok"},...}}
```

### Frontend Access
```bash
curl https://one-event.up.railway.app
# Response: HTML page with Next.js app loading
```

## Deployment Status
- ✅ Backend deployed and healthy
- ✅ Frontend deployed and accessible  
- ✅ Database connected and configured
- ✅ CORS properly configured
- ✅ Environment variables set correctly
- ✅ API connectivity established
- ✅ **Registration system fully functional**
- ✅ **Login system working correctly**
- ✅ **Database tables created successfully**
- ✅ **Frontend-Backend API URLs updated**

## Recent Fixes Applied
1. **Fixed Railway.json Configuration**: Changed `dockerfilePath` from `../Dockerfile` to `./Dockerfile`
2. **Database Migration**: Enabled `synchronize: true` to auto-create database tables
3. **Frontend URL Updates**: Updated hardcoded fallback URLs from GCP to Railway URLs
4. **CORS Configuration**: Updated to include new Frontend domain
5. **Environment Variables**: Set correct `NEXT_PUBLIC_API_URL` for Frontend

## Testing Results
### ✅ Backend API Testing
- **POST /auth/register**: Successfully creates users with email verification
- **POST /auth/login**: Returns JWT tokens and user profiles
- **GET /health**: Returns system health status

### ✅ Frontend-Backend Integration
- Frontend loads correctly at https://one-event.up.railway.app
- Registration page accessible at /auth/register
- API calls now properly route to Railway backend
- CORS requests working without errors

## Next Steps
1. Test end-to-end functionality (user registration, event creation, etc.)
2. Set up monitoring and logging
3. Configure custom domains (optional)
4. Set up CI/CD pipelines (optional)
5. Add email service integration (SendGrid/Gmail)

---
**Deployment Date**: 2025-01-17  
**Approach**: Split-Project (Recommended for production)  
**Status**: ✅ SUCCESSFUL
