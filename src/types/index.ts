export interface User {
  _id: string;
  full_name: string;
  email: string;
  role: 'client' | 'craftsman';
  profile_image?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories: string[];
}
