# OneEvent Frontend

A modern, responsive web application built with Next.js for event management and registration. This frontend connects to the OneEvent Backend API to provide a complete event management solution.

## 🚀 Features

### Core Features
- **User Authentication**: Login, registration, and profile management
- **Event Discovery**: Browse, search, and filter events
- **Event Registration**: Register for events with real-time availability
- **User Profile**: Manage personal information and view registration history
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Dynamic content updates and error handling

### User Roles
- **Guest Users**: Browse published events, register for events, manage profile
- **Admin Users**: All guest features plus event creation and management

### Pages Implemented
- **Homepage** (`/`): Landing page with featured events and call-to-action
- **Events Listing** (`/events`): Complete event browser with search and filters
- **Event Details** (`/events/[id]`): Detailed event view with registration
- **User Profile** (`/profile`): Profile management and registration history
- **Authentication** (`/auth/login`, `/auth/register`): User login and registration

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.4 with TypeScript
- **Styling**: Tailwind CSS with responsive design
- **State Management**: React Context API for authentication
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors for token management
- **Icons**: Lucide React icons
- **UI Components**: Headless UI for accessible components

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- OneEvent Backend running on `http://localhost:3000`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (optional):
   Create `.env.local` if you need to override API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3001`

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📱 Key Features

### Authentication Flow
1. **Registration**: Users can create accounts with name, email, and password
2. **Login**: Email/password authentication with JWT tokens
3. **Token Management**: Automatic token storage and refresh
4. **Protected Routes**: Access control based on authentication status
5. **Role-based Features**: Admin users see additional management options

### Event Management
- **Search & Filter**: Real-time event search by title, location, status, and date
- **Event Details**: Comprehensive event information with registration
- **Registration System**: One-click registration with capacity tracking
- **Status Tracking**: Monitor registration status (pending, confirmed, cancelled)

### User Profile
- **Profile Management**: Update personal information
- **Registration History**: View all past and current event registrations
- **Registration Control**: Cancel registrations when needed

## 🎨 Design

The application features a modern, responsive design:
- **Mobile-first**: Optimized for mobile devices
- **Clean UI**: Minimalist design with clear navigation
- **Consistent Branding**: Indigo color scheme throughout
- **Accessible**: Keyboard navigation and screen reader support

## 📊 API Integration

Integrates with OneEvent Backend API endpoints:
- Authentication (`/auth/*`)
- Events (`/events/*`)
- Registrations (`/registrations/*`)
- User Management (`/users/*`)

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
```

## 🚀 Deployment

The application can be deployed to Vercel, Netlify, or any Node.js hosting platform.

---

Built with ❤️ using Next.js and TypeScript
