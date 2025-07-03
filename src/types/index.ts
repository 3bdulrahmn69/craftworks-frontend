export interface User {
  _id: string;
  full_name: string;
  email: string;
  role: 'client' | 'craftsman';
  rating?: number;
  rating_count?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
