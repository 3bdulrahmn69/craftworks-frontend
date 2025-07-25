export interface User {
  id: string;
  email: string;
  phone: string;
  role: 'client' | 'craftsman';
  fullName: string;
  profilePicture: string;
  createdAt: string;
  address: {
    country: string;
    state: string;
    city: string;
    street: string;
  };
  rating: number;
  ratingCount: number;
}

// API Response wrapper interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
