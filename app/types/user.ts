export interface User {
  id: string;
  email: string;
  phone: string;
  role: 'client' | 'craftsman' | 'admin' | 'moderator';
  fullName: string;
  profilePicture: string;
  createdAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'none';
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
}

// Recommended Craftsman interface based on the API response
export interface RecommendedCraftsman {
  _id: string;
  fullName: string;
  profilePicture: string;
  craftsmanInfo: {
    skills: string[];
    service: {
      _id: string;
      name: string;
      icon: string;
      description: string;
    };
    bio: string;
    portfolioImageUrls: string[];
    verificationStatus: 'pending' | 'verified' | 'rejected';
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
