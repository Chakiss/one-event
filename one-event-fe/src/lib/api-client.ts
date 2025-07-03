import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import type {
  ApiResponse,
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventFilterRequest,
  Registration,
  CreateRegistrationRequest,
  RegistrationStats,
  HealthResponse,
  PaginatedEventsResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  UpdateLandingPageRequest,
} from '../types/api';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
    console.log('🔗 API Client initialized with baseURL:', this.baseURL);
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
          // Redirect to login if needed
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | undefined {
    // Try cookies first
    let token = Cookies.get('auth_token');
    
    // Fallback to localStorage if cookies don't work
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('auth_token') || undefined;
    }
    
    console.log('Getting token:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token found');
    return token;
  }

  private setToken(token: string): void {
    console.log('Setting token:', token ? `Token (${token.substring(0, 20)}...)` : 'No token');
    
    // Set in cookies
    Cookies.set('auth_token', token, { 
      expires: 7, // 7 days
      path: '/',
      sameSite: 'lax'
    });
    
    // Also set in localStorage as fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeToken(): void {
    console.log('Removing token from storage');
    
    // Remove from cookies
    Cookies.remove('auth_token', { path: '/' });
    
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Auth API
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.client.post('/auth/login', data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    console.log('Register request data:', data);
    console.log('API base URL:', this.baseURL);
    const response: AxiosResponse<ApiResponse<User>> = await this.client.post('/auth/register', data);
    console.log('Register response:', response.data);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get('/auth/profile');
    return response.data;
  }

  async logout(): Promise<void> {
    this.removeToken();
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<string>> {
    const response: AxiosResponse<ApiResponse<string>> = await this.client.post('/auth/verify-email', data);
    return response.data;
  }

  async resendEmailVerification(data: ResendVerificationRequest): Promise<ApiResponse<string>> {
    const response: AxiosResponse<ApiResponse<string>> = await this.client.post('/auth/resend-verification', data);
    return response.data;
  }

  // User API
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.client.get('/users');
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get(`/users/${id}`);
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.client.patch('/users/me', data);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.client.patch(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }

  // Event API
  async getEvents(filters?: EventFilterRequest): Promise<Event[]> {
    const response: AxiosResponse<PaginatedEventsResponse> = await this.client.get('/events', { params: filters });
    return response.data.events;
  }

  async getPublishedEvents(): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await this.client.get('/events/published');
    return response.data;
  }

  async getMyEvents(): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await this.client.get('/events/my-events');
    return response.data;
  }

  async getEvent(id: string): Promise<Event> {
    const response: AxiosResponse<Event> = await this.client.get(`/events/${id}`);
    return response.data;
  }

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response: AxiosResponse<Event> = await this.client.post('/events', data);
    return response.data;
  }

  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    const response: AxiosResponse<Event> = await this.client.patch(`/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.client.delete(`/events/${id}`);
  }

  async publishEvent(id: string): Promise<Event> {
    const response: AxiosResponse<Event> = await this.client.patch(`/events/${id}/publish`);
    return response.data;
  }

  async cancelEvent(id: string): Promise<Event> {
    const response: AxiosResponse<Event> = await this.client.patch(`/events/${id}/cancel`);
    return response.data;
  }

  async getAllEventsAdmin(filters?: EventFilterRequest): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await this.client.get('/events/admin/all', { params: filters });
    return response.data;
  }

  // Landing Page API
  async getEventLandingPage(eventId: string): Promise<Event> {
    const response: AxiosResponse<Event> = await this.client.get(`/events/${eventId}/landing-page`);
    return response.data;
  }

  async updateEventLandingPage(eventId: string, data: UpdateLandingPageRequest): Promise<Event> {
    const response: AxiosResponse<Event> = await this.client.patch(`/events/${eventId}/landing-page`, data);
    return response.data;
  }

  async getPublicLandingPage(slug: string): Promise<Event> {
    const response: AxiosResponse<Event> = await this.client.get(`/events/slug/${slug}`);
    return response.data;
  }

  // Registration API
  async getRegistrations(): Promise<Registration[]> {
    const response: AxiosResponse<Registration[]> = await this.client.get('/registrations');
    return response.data;
  }

  async getMyRegistrations(): Promise<Registration[]> {
    const response: AxiosResponse<Registration[]> = await this.client.get('/registrations/my-registrations');
    return response.data;
  }

  async getEventRegistrations(eventId: string): Promise<Registration[]> {
    const response: AxiosResponse<Registration[]> = await this.client.get(`/registrations/my-event/${eventId}`);
    return response.data;
  }

  async getEventStats(eventId: string): Promise<RegistrationStats> {
    console.log(`Calling /registrations/my-event/${eventId}/stats`);
    const response: AxiosResponse<RegistrationStats> = await this.client.get(`/registrations/my-event/${eventId}/stats`);
    console.log(`Stats response for event ${eventId}:`, response.data);
    return response.data;
  }

  async getRegistration(id: string): Promise<Registration> {
    const response: AxiosResponse<Registration> = await this.client.get(`/registrations/${id}`);
    return response.data;
  }

  async registerForEvent(data: CreateRegistrationRequest): Promise<Registration> {
    const response: AxiosResponse<Registration> = await this.client.post('/registrations', data);
    return response.data;
  }

  async updateRegistration(id: string, data: Partial<Registration>): Promise<Registration> {
    const response: AxiosResponse<Registration> = await this.client.patch(`/registrations/${id}`, data);
    return response.data;
  }

  async cancelRegistration(id: string): Promise<Registration> {
    const response: AxiosResponse<Registration> = await this.client.patch(`/registrations/${id}/cancel`);
    return response.data;
  }

  async confirmRegistration(id: string): Promise<Registration> {
    const response: AxiosResponse<Registration> = await this.client.patch(`/registrations/${id}/confirm`);
    return response.data;
  }

  async markAttended(id: string): Promise<Registration> {
    const response: AxiosResponse<Registration> = await this.client.patch(`/registrations/${id}/attended`);
    return response.data;
  }

  async deleteRegistration(id: string): Promise<void> {
    await this.client.delete(`/registrations/${id}`);
  }

  // Health API
  async getHealth(): Promise<HealthResponse> {
    const response: AxiosResponse<HealthResponse> = await this.client.get('/health');
    return response.data;
  }

  // Dashboard API
  async getDashboardData(): Promise<Event[]> {
    // Get events with registration counts
    const response: AxiosResponse<Event[]> = await this.client.get('/events/my-events');
    console.log('My events response:', response.data);
    
    // For each event, fetch registration stats
    const eventsWithStats = await Promise.all(
      response.data.map(async (event) => {
        try {
          console.log(`Fetching stats for event ${event.id} (${event.title})`);
          
          // Try to get stats first
          try {
            const stats = await this.getEventStats(event.id);
            console.log(`Stats for event ${event.id}:`, stats);
            return {
              ...event,
              _count: {
                registrations: stats.total || 0
              }
            };
          } catch (statsError) {
            console.warn(`Stats endpoint failed for ${event.id}, trying registrations endpoint:`, statsError);
            
            // Fallback: get registrations and count them
            const registrations = await this.getEventRegistrations(event.id);
            console.log(`Direct registrations for event ${event.id}:`, registrations.length);
            return {
              ...event,
              _count: {
                registrations: registrations.length
              }
            };
          }
        } catch (error) {
          console.warn(`Failed to fetch any data for event ${event.id}:`, error);
          return {
            ...event,
            _count: {
              registrations: 0
            }
          };
        }
      })
    );
    
    return eventsWithStats;
  }

  // Generic HTTP methods
  async get<T>(url: string): Promise<{ data: T }> {
    const response = await this.client.get<T>(url);
    return { data: response.data };
  }

  async post<T>(url: string, data?: unknown): Promise<{ data: T }> {
    const response = await this.client.post<T>(url, data);
    return { data: response.data };
  }

  async patch<T>(url: string, data?: unknown): Promise<{ data: T }> {
    const response = await this.client.patch<T>(url, data);
    return { data: response.data };
  }

  async put<T>(url: string, data?: unknown): Promise<{ data: T }> {
    const response = await this.client.put<T>(url, data);
    return { data: response.data };
  }

  async delete<T>(url: string): Promise<{ data: T }> {
    const response = await this.client.delete<T>(url);
    return { data: response.data };
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getApiUrl(): string {
    return this.baseURL;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
