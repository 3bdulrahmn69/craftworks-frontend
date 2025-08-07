// Job related types based on the backend API
export interface Job {
  _id: string;
  title: string;
  description: string;
  category?: string; // Legacy field for backward compatibility
  service?: Service;
  photos?: string[];
  address: {
    country: string;
    state: string;
    city: string;
    street: string;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  paymentType: 'cash' | 'visa';
  status: 'Posted' | 'Hired' | 'In Progress' | 'Completed' | 'Cancelled';
  client:
    | string
    | {
        _id: string;
        fullName: string;
        phone: string;
      };
  craftsman?: string | null;
  platformFee: number;
  appliedCraftsmen: string[];
  jobDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Service {
  _id: string;
  name:
    | string
    | {
        en: string;
        ar: string;
      };
  description:
    | string
    | {
        en: string;
        ar: string;
      };
  image: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Quote {
  _id: string;
  job: {
    _id: string;
    title: string;
    description: string;
    photos?: string[];
    address: {
      country: string;
      state: string;
      city: string;
      street: string;
    };
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
    status: string;
    createdAt: string;
    client: {
      _id: string;
      fullName: string;
      profilePicture?: string;
      rating?: number;
      ratingCount?: number;
    };
  };
  craftsman:
    | string
    | {
        _id: string;
        fullName: string;
        profilePicture?: string;
        rating?: number;
        ratingCount?: number;
      };
  price: number;
  notes?: string;
  status: 'Submitted' | 'Accepted' | 'Rejected';
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

// Type for job applications viewed by clients
export interface JobApplication {
  _id: string;
  job: string; // Job ID only, since client already knows the job
  craftsman: {
    _id: string;
    fullName: string;
    profilePicture?: string;
    rating?: number;
    ratingCount?: number;
  };
  price: number;
  notes?: string;
  status: 'Submitted' | 'Accepted' | 'Declined';
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

export interface Invitation {
  id: string;
  _id: string;
  job: {
    _id: string;
    title: string;
    client: {
      fullName: string;
      profilePicture?: string;
      rating?: number;
      ratingCount?: number;
    };
    paymentType: string;
  };
  craftsman: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
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

export interface JobsApiResponse extends ApiResponse<Job[]> {
  success: boolean;
  data: Job[];
  pagination?: Pagination;
}

export interface JobApiResponse extends ApiResponse<Job> {
  success: boolean;
  data: Job;
}

export interface QuoteApiResponse extends ApiResponse<Quote> {
  success: boolean;
  data: Quote;
}

export interface JobApplicationsApiResponse
  extends ApiResponse<JobApplication[]> {
  success: boolean;
  data: JobApplication[];
}

export interface ServicesApiResponse extends ApiResponse<Service[]> {
  success: boolean;
  data: Service[];
}
