// Job related types based on the backend API
export interface Job {
  _id: string;
  title: string;
  description: string;
  category: string; // Legacy field, keeping for backward compatibility
  service?: Service; // New populated service object (API v1.3.0)
  photos?: string[];
  address:
    | string
    | {
        // Address can be string or structured object
        country: string;
        state: string;
        city: string;
        street: string;
      };
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  paymentType: string;
  status: 'Posted' | 'Hired' | 'In Progress' | 'Completed' | 'Cancelled';
  client: string;
  craftsman?: string | null;
  jobPrice: number;
  platformFee: number;
  appliedCraftsmen: string[];
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

export interface Service {
  _id: string;
  name: string;
  icon: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Quote {
  id: string;
  _id: string;
  job: {
    id: string;
    title: string;
    client: {
      name: string;
      rating?: number;
      reviewCount?: number;
    };
  };
  craftsman: string;
  price: number;
  notes?: string;
  status: 'submitted' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface Invitation {
  id: string;
  _id: string;
  job: {
    id: string;
    title: string;
    client: {
      name: string;
      rating?: number;
      reviewCount?: number;
    };
    paymentType: string;
  };
  craftsman: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  // Legacy fields for backward compatibility
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  pagination?: Pagination;
}

export interface JobsApiResponse extends ApiResponse {
  data: Job[];
  pagination: Pagination;
}

export interface JobApiResponse extends ApiResponse {
  data: Job;
}

export interface QuoteApiResponse extends ApiResponse {
  data: Quote;
}

export interface ServicesApiResponse extends ApiResponse {
  data: Service[];
}
