export interface User {
  id: string;
  email: string;
  phone: string;
  role: 'client' | 'craftsman' | 'admin' | 'moderator';
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
  service?: {
    _id: string;
    name: string;
    icon: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
  craftsmanInfo?: {
    skills: string[];
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verificationDocuments?: string[];
  };
}

// API Response wrapper interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
