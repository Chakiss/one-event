# 🎉 OneEvent - Event Management System

A comprehensive event management platform built with modern technologies, featuring customizable landing pages, user registration, and real-time event management.

![OneEvent Banner](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=OneEvent+-+Manage+Events+Like+a+Pro)

## ✨ Features

### 🎯 Core Features
- **Event Management**: Create, edit, and manage events with rich details
- **User Registration**: Secure user authentication and profile management
- **Event Registration**: Allow users to register for events with status tracking
- **Admin Dashboard**: Comprehensive admin panel for event oversight

### 🎨 Landing Page Builder
- **Customizable Landing Pages**: Visual builder for event-specific pages
- **Real-time Preview**: See changes instantly while building
- **Responsive Design**: Mobile-friendly landing pages
- **Custom Branding**: Add your own CSS and JavaScript

### 🔧 Technical Features
- **RESTful API**: Well-documented NestJS backend
- **Modern Frontend**: Next.js with TypeScript and TailwindCSS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based secure authentication
- **Email Integration**: Automated email notifications

## 🏗️ Architecture

```
one-event/
├── 📂 one-event-be/         # NestJS Backend API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── modules/
│   │   │   ├── event/      # Event management
│   │   │   └── registration/ # Registration system
│   │   └── migrations/     # Database migrations
│   └── ...
├── 📂 one-event-fe/         # Next.js Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript types
│   └── ...
├── 📂 docs/                # Documentation
├── 📂 scripts/             # Deployment scripts
└── 📂 infrastructure/      # Infrastructure as Code
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Chakiss/one-event.git
cd one-event
```

### 2. Setup Backend
```bash
cd one-event-be
npm install

# Copy environment file
cp .env.example .env

# Setup database (update DATABASE_URL in .env)
npm run typeorm:migration:run

# Start development server
npm run start:dev
```

### 3. Setup Frontend
```bash
cd ../one-event-fe
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api

## 🐳 Docker Setup

For quick local development with Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 Documentation

- [🚀 GCP Deployment Guide](./docs/GCP_DEPLOYMENT_GUIDE.md)
- [🏗️ Monorepo Structure Guide](./docs/MONOREPO_STRUCTURE.md)
- [📖 Landing Page System](./LANDING-PAGE-SYSTEM.md)
- [✅ Implementation Status](./LANDING_PAGE_IMPLEMENTATION_COMPLETE.md)

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Custom components
- **State Management**: React hooks
- **API Client**: Axios

### Infrastructure
- **Cloud**: Google Cloud Platform
- **Containers**: Docker + Cloud Run
- **Database**: Cloud SQL (PostgreSQL)
- **CI/CD**: GitHub Actions
- **IaC**: Terraform

## 🌟 Key Highlights

### Landing Page Builder
The standout feature is our visual landing page builder that allows event organizers to create beautiful, custom landing pages for their events:

- **Drag & Drop Interface**: Easy-to-use visual builder
- **Live Preview**: Real-time preview of changes
- **Custom Sections**: Hero, About, Schedule, Registration forms
- **Responsive Design**: Automatically optimized for all devices
- **SEO Friendly**: Built-in SEO optimization

### Event Management
Comprehensive event management with:
- Event creation and editing
- Registration management
- Attendee tracking
- Email notifications
- Analytics and reporting

## 🚀 Deployment

### Development
```bash
# Local development
npm run dev

# Run tests
npm run test

# Lint code
npm run lint
```

### Production (GCP)
```bash
# Setup GCP infrastructure
./scripts/setup-gcp.sh

# Deploy with GitHub Actions
git push origin main
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

When running locally, visit http://localhost:8000/api for complete API documentation with Swagger UI.

### Key Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /events` - List events
- `POST /events` - Create event
- `PATCH /events/:id/landing-page` - Update landing page
- `POST /registrations` - Register for event

## 🔧 Environment Variables

### Backend (.env)
```bash
PORT=8000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 Project Status

✅ **Completed Features**
- User authentication and management
- Event CRUD operations
- Registration system with status tracking
- Landing page builder with live preview
- Public landing page rendering
- Admin dashboard
- Email notifications
- API documentation

🚧 **In Progress**
- Enhanced analytics
- Mobile app
- Advanced theming options

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development**: Full-stack development with modern best practices
- **Design**: User-centric design with focus on usability
- **DevOps**: Cloud-native deployment with CI/CD

## 🌐 Links

- **Live Demo**: [Coming Soon]
- **API Docs**: http://localhost:8000/api (when running locally)
- **Issues**: [GitHub Issues](https://github.com/Chakiss/one-event/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Chakiss/one-event/discussions)

---

<p align="center">
  <strong>Built with ❤️ using modern web technologies</strong>
</p>

<p align="center">
  <a href="#quick-start">Get Started</a> •
  <a href="./docs/GCP_DEPLOYMENT_GUIDE.md">Deploy</a> •
  <a href="https://github.com/Chakiss/one-event/issues">Report Bug</a> •
  <a href="https://github.com/Chakiss/one-event/discussions">Discussions</a>
</p>
# Force deploy to fix public registration endpoint
# Force restart to load PublicRegistrationController
