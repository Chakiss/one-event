// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  phone?: string;
  department?: string;
  role: 'admin' | 'guest' | 'manager';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  company?: string;
  position?: string;
  phone?: string;
  department?: string;
  role?: 'admin' | 'guest' | 'manager';
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  address?: string;
  maxAttendees: number;
  price: string; // Backend returns as string
  imageUrl?: string;
  type: 'conference' | 'workshop' | 'seminar' | 'networking' | 'other';
  status: 'draft' | 'published' | 'cancelled';
  createdBy?: string;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
    role: string;
    company?: string;
    position?: string;
    phone?: string;
    department?: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  registrations?: Registration[];
  _count?: {
    registrations: number;
  };
  // Landing page fields
  landingPageHtml?: string;
  landingPageConfig?: string;
  customCss?: string;
  customJs?: string;
  slug?: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees: number;
  type: 'conference' | 'workshop' | 'seminar' | 'meetup' | 'webinar' | 'networking' | 'other';
  registrationDeadline?: string;
  tags?: string[];
  price?: number;
  requirements?: string;
  agenda?: string;
  address?: string;
}

export type UpdateEventRequest = Partial<CreateEventRequest> & {
  status?: 'draft' | 'published' | 'cancelled';
};

export interface EventFilterRequest {
  title?: string;
  location?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Landing Page Types
export interface LandingPageData {
  landingPageHtml?: string;
  landingPageConfig?: string;
  customCss?: string;
  customJs?: string;
  slug?: string;
}

export interface UpdateLandingPageRequest {
  landingPageHtml?: string;
  landingPageConfig?: string;
  customCss?: string;
  customJs?: string;
  slug?: string;
}

// Registration Types
export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  registeredAt: string;
  updatedAt: string;
  event?: Event;
  user?: User;
}

export interface CreateRegistrationRequest {
  eventId: string;
}

export interface RegistrationStats {
  totalRegistrations: number;
  confirmedRegistrations: number;
  cancelledRegistrations: number;
  attendedCount: number;
  maxAttendees: number;
  availableSpots: number;
}

// Health Types
export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    api: {
      status: string;
      message: string;
    };
    email: {
      status: string;
      message: string;
    };
  };
}

// Paginated Response Types
export interface PaginatedEventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
