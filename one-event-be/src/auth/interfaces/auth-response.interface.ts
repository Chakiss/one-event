export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'guest' | 'manager';
    createdAt: Date;
    updatedAt: Date;
  };
}
