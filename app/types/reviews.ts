// Review and dispute related types based on the backend API

export interface Review {
  id: string;
  job: string;
  reviewer: {
    id: string;
    fullName: string;
    profilePicture?: string;
    role: 'client' | 'craftsman';
  };
  reviewee: {
    id: string;
    fullName: string;
    profilePicture?: string;
    role: 'client' | 'craftsman';
  };
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  jobId: string;
  rating: number;
  comment: string;
}

export interface ReviewEligibility {
  canReview: boolean;
  reason?: string;
  hasReviewed?: boolean;
}

export interface Dispute {
  _id: string;
  job: {
    _id: string;
    title: string;
    client: {
      _id: string;
      fullName: string;
      profilePicture?: string;
    };
    craftsman: {
      _id: string;
      fullName: string;
      profilePicture?: string;
    };
  };
  disputedBy: {
    _id: string;
    fullName: string;
    profilePicture?: string;
    role: 'client' | 'craftsman';
  };
  reason:
    | 'poor_quality'
    | 'no_show'
    | 'payment_issue'
    | 'behavior_issue'
    | 'other';
  description: string;
  evidence?: {
    text?: string;
    files?: string[];
  };
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  resolution?: {
    decision: string;
    resolvedBy: string;
    resolvedAt: string;
    refundAmount?: number;
    penaltyToUser?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDisputeRequest {
  jobId: string;
  reason:
    | 'poor_quality'
    | 'no_show'
    | 'payment_issue'
    | 'behavior_issue'
    | 'other';
  description: string;
  evidence?: {
    text?: string;
  };
}

// API Response types
export interface ReviewApiResponse {
  success: boolean;
  data: Review;
  message?: string;
}

export interface ReviewsApiResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalItems: number;
    };
  };
  message?: string;
}

export interface ReviewEligibilityResponse {
  success: boolean;
  data: ReviewEligibility;
  message?: string;
}

export interface DisputeApiResponse {
  success: boolean;
  data: Dispute;
  message?: string;
}

export interface DisputesApiResponse {
  success: boolean;
  data: Dispute[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}
