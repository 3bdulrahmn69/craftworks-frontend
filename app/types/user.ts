import { Service } from './jobs';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: 'client' | 'craftsman';
  fullName: string;
  profilePicture?: string;
  createdAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'none';
  address: {
    country: string;
    state: string;
    city: string;
    street: string;
  };
  bio?: string;
  rating: number;
  ratingCount: number;
  service?: Service;
  portfolioImageUrls?: string[]; // Portfolio images for craftsmen
}

// Recommended Craftsman interface based on the API response
export interface RecommendedCraftsman {
  _id: string;
  fullName: string;
  profilePicture: string;
  craftsmanInfo: {
    service: {
      _id: string;
      name: string;
      icon: string;
      description: string;
    };
    bio?: string;
    portfolioImageUrls?: string[];
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'none';
    verificationDocs: string[];
  };
  rating: number;
  ratingCount: number;
  isInvited?: boolean; // Optional field to track invitation status
}

// API Response wrapper interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
