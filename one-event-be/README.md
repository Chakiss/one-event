# One Event - Backend API

A secure, production-ready NestJS backend for an event management system with PostgreSQL, TypeORM, JWT authentication, and role-based access control.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/Guest)
- Password hashing with bcrypt
- Protected routes and decorators
- Rate limiting for authentication endpoints

### 👥 User Management
- User registration and login
- Profile management
- Admin user management
- Role-based permissions

### 📅 Event Management
- Complete CRUD operations for events
- Event publishing and cancellation
- Event filtering and search
- Admin oversight capabilities
- Event types: conference, workshop, seminar, networking, other

### 📝 Registration System
- Event registration for users
- Registration status management (pending, confirmed, cancelled, attended)
- Admin confirmation and attendance tracking
- Registration statistics
- Duplicate registration prevention
- Event capacity management

### 📧 Email Notification System
- Automated email notifications for registration events
- Registration confirmation emails
- Registration approval notifications
- Event cancellation notifications
- Event reminder emails
- HTML email templates with Handlebars
- Development preview with Ethereal Email
- Production SMTP support

### 📚 API Documentation
- Complete Swagger/OpenAPI 3.0 documentation
- Interactive API testing interface
- Detailed endpoint descriptions and examples
- Authentication flow documentation
- Response schema definitions

### 🛡️ Rate Limiting & Security
- Global rate limiting to prevent abuse
- Endpoint-specific rate limits
- Authentication rate limiting (login/register)
- Configurable throttling rules
- IP-based request tracking

## 🛠 Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT, Passport
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI 3.0
- **Rate Limiting**: @nestjs/throttler
- **Email**: Nodemailer with Handlebars templates
- **Security**: Helmet, CORS, Rate limiting
- **Password Hashing**: bcrypt
- **Email Service**: Nodemailer
- **Email Templates**: Handlebars
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd one-event-be
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=one_event

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email Configuration (Production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@oneevent.com

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup
```bash
# Create database
createdb one_event

# Run the application (it will auto-sync tables)
npm run start:dev
```

### 5. Seed Data (Optional)
```bash
# Create sample users and events
npm run seed
```

## 🚀 Running the Application

### Development
```bash
npm run start:dev
```

The application will start on `http://localhost:3000`

**Important URLs:**
- **API Base**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

### Production
```bash
npm run build
npm run start:prod
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 API Documentation

### Interactive Documentation (Swagger)

The complete API documentation is available through Swagger UI:

- **Local Development**: http://localhost:3000/api
- **Production**: https://api.oneevent.com/api

The Swagger interface provides:
- Interactive API testing
- Complete endpoint documentation
- Request/response examples
- Authentication testing
- Schema definitions

### Rate Limiting

The API implements rate limiting to prevent abuse:

- **Global Limits**: 100 requests per minute
- **Authentication**: 3-5 requests per 5 minutes
- **Custom Limits**: Per-endpoint specific limits

For detailed rate limiting information, see [docs/RATE_LIMITING.md](./docs/RATE_LIMITING.md)

### Quick API Reference

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "guest" // or "admin"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <jwt_token>
```

### User Management Endpoints

#### Get All Users (Admin only)
```http
GET /users
Authorization: Bearer <admin_jwt_token>
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer <jwt_token>
```

#### Update Profile
```http
PATCH /users/me
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

### Event Management Endpoints

#### Create Event (Admin only)
```http
POST /events
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "Tech Conference 2025",
  "description": "Annual technology conference",
  "type": "conference",
  "startDate": "2025-07-01T10:00:00Z",
  "endDate": "2025-07-01T18:00:00Z",
  "location": "Convention Center",
  "maxAttendees": 500
}
```

#### Get Published Events
```http
GET /events/published
```

#### Get Event by ID
```http
GET /events/:id
```

#### Update Event
```http
PATCH /events/:id
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "Updated Event Title"
}
```

#### Publish Event
```http
PATCH /events/:id/publish
Authorization: Bearer <admin_jwt_token>
```

#### Cancel Event
```http
PATCH /events/:id/cancel
Authorization: Bearer <admin_jwt_token>
```

### Registration Endpoints

#### Register for Event
```http
POST /registrations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "eventId": "event-uuid",
  "notes": "Looking forward to this event!"
}
```

#### Get My Registrations
```http
GET /registrations/my-registrations
Authorization: Bearer <jwt_token>
```

#### Get Event Registrations (Admin only)
```http
GET /registrations/event/:eventId
Authorization: Bearer <admin_jwt_token>
```

#### Get Registration Statistics (Admin only)
```http
GET /registrations/event/:eventId/stats
Authorization: Bearer <admin_jwt_token>
```

#### Confirm Registration (Admin only)
```http
PATCH /registrations/:id/confirm
Authorization: Bearer <admin_jwt_token>
```

#### Mark Attended (Admin only)
```http
PATCH /registrations/:id/attended
Authorization: Bearer <admin_jwt_token>
```

#### Cancel Registration
```http
PATCH /registrations/:id/cancel
Authorization: Bearer <jwt_token>
```

## 🗄 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `role` (Enum: admin, guest)
- `createdAt`, `updatedAt`

### Events Table
- `id` (UUID, Primary Key)
- `title`, `description`
- `type` (Enum: conference, workshop, seminar, networking, other)
- `status` (Enum: draft, published, cancelled)
- `startDate`, `endDate`
- `location`, `address`
- `maxAttendees`, `price`
- `requirements`, `agenda`, `tags`
- `imageUrl`, `registrationDeadline`
- `organizerId` (Foreign Key to Users)
- `createdAt`, `updatedAt`

### Registrations Table
- `id` (UUID, Primary Key)
- `userId` (Foreign Key to Users)
- `eventId` (Foreign Key to Events)
- `status` (Enum: pending, confirmed, cancelled, attended)
- `notes`, `additionalInfo`
- `registeredAt`, `confirmedAt`, `cancelledAt`, `attendedAt`
- `createdAt`, `updatedAt`
- Unique constraint: `(userId, eventId)`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Access Control**: Admin and Guest roles
- **Input Validation**: class-validator for request validation
- **Route Guards**: Protect sensitive endpoints
- **Duplicate Prevention**: Unique constraints and business logic

## ✅ Testing Results

### Registration API Testing Summary
All registration endpoints have been thoroughly tested and are working correctly:

- ✅ User registration for events
- ✅ View personal registrations
- ✅ Admin confirmation and attendance tracking
- ✅ Registration statistics
- ✅ Duplicate registration prevention
- ✅ Role-based access control
- ✅ Proper error handling

### Test Coverage
- Authentication and authorization
- CRUD operations for all entities
- Business logic validation
- Security and access controls
- Data integrity and relationships

## 📈 Current Status

### ✅ Completed Features
1. **Authentication System**
   - JWT and Local strategies
   - Role-based guards and decorators
   - User registration and login

2. **User Management**
   - Complete CRUD operations
   - Profile management
   - Admin user oversight

3. **Event Management**
   - Full event lifecycle management
   - Publishing and cancellation
   - Filtering and search capabilities

4. **Registration System**
   - Event registration workflow
   - Status management
   - Admin oversight tools
   - Statistics and reporting

5. **Security & Validation**
   - Input validation and sanitization
   - Protected routes and authorization
   - Data integrity constraints

## 🚧 Next Steps (Recommended Priority)

### 1. 📧 Email Notification System
**Priority: High**
```bash
npm install @nestjs/mailer nodemailer handlebars
```
- Registration confirmations
- Event updates and reminders
- Cancellation notifications
- Custom email templates

### 2. 📖 API Documentation (Swagger/OpenAPI)
**Priority: High**
```bash
npm install @nestjs/swagger swagger-ui-express
```
- Interactive API documentation
- Request/response schemas
- Authentication examples
- Frontend developer friendly

### 3. 🛡 Security Hardening
**Priority: Medium**
```bash
npm install @nestjs/throttler helmet compression
```
- Rate limiting for API endpoints
- Request compression
- Security headers
- DDoS protection

### 4. 📊 Advanced Event Features
**Priority: Medium**
- Real-time capacity management
- Waitlist functionality
- Event categories and tags
- Advanced search and filtering

### 5. 🔄 Frontend Integration
**Priority: Medium**
- CORS configuration for Next.js
- API client generation
- WebSocket for real-time updates
- File upload for event images

### 6. 📈 Analytics & Monitoring
**Priority: Low**
- Event analytics dashboard
- User engagement metrics
- System performance monitoring
- Logging and error tracking

### 7. 🌐 Advanced Features
**Priority: Low**
- Multi-language support
- Payment integration
- QR code check-ins
- Social media integration

## 🏗 Architecture Overview

```
src/
├── auth/                 # Authentication module
│   ├── decorators/      # Custom decorators
│   ├── dto/            # Data transfer objects
│   ├── guards/         # Route guards
│   ├── interfaces/     # Type definitions
│   └── strategies/     # Passport strategies
├── users/              # User management
├── modules/
│   ├── event/          # Event management
│   └── registration/   # Registration system
├── config/             # Configuration files
├── database/           # Database utilities
└── main.ts            # Application entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test files for usage examples

---

**Built with ❤️ using NestJS and TypeScript**
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
