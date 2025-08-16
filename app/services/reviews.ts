import { api } from './api';
import {
  CreateReviewRequest,
  ReviewApiResponse,
  ReviewsApiResponse,
  ReviewEligibilityResponse,
  DisputeApiResponse,
  DisputesApiResponse,
} from '@/app/types/reviews';

// Helper function to flatten nested API responses
const flattenResponse = (response: any): any => {
  if (response.data?.data && response.data?.pagination) {
    // Handle paginated responses
    return {
      success: response.success,
      data: response.data.data,
      pagination: response.data.pagination,
      message: response.message,
    };
  } else if (response.data?.data) {
    // Handle single item responses
    return {
      success: response.success,
      data: response.data.data,
      message: response.message,
    };
  }
  // Return as-is if already flattened
  return response;
};

export const reviewsService = {
  // Create a review
  async createReview(
    reviewData: CreateReviewRequest,
    token: string
  ): Promise<ReviewApiResponse> {
    const response = await api.post('/reviews', reviewData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return flattenResponse(response.data);
  },

  // Get user reviews with pagination
  async getUserReviews(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
    },
    token?: string
  ): Promise<ReviewsApiResponse> {
    const response = await api.get(`/reviews/user/${userId}`, {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  // Get last 20 user reviews (no pagination)
  async getLastUserReviews(
    userId: string,
    token?: string
  ): Promise<ReviewsApiResponse> {
    const response = await api.get(`/reviews/user/${userId}`, {
      params: { limit: 20 },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  // Get job reviews
  async getJobReviews(
    jobId: string,
    token: string
  ): Promise<ReviewsApiResponse> {
    const response = await api.get(`/reviews/job/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return flattenResponse(response.data);
  },

  // Check review eligibility
  async checkReviewEligibility(
    jobId: string,
    token: string
  ): Promise<ReviewEligibilityResponse> {
    const response = await api.get(`/reviews/job/${jobId}/can-review`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return flattenResponse(response.data);
  },

  // Create a dispute
  async createDispute(
    disputeData: FormData,
    token: string
  ): Promise<DisputeApiResponse> {
    const response = await api.post('/disputes', disputeData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return flattenResponse(response.data);
  },

  // Get dispute details
  async getDispute(
    disputeId: string,
    token: string
  ): Promise<DisputeApiResponse> {
    const response = await api.get(`/disputes/${disputeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return flattenResponse(response.data);
  },

  // Add evidence to dispute
  async addDisputeEvidence(
    disputeId: string,
    evidenceData: FormData,
    token: string
  ): Promise<DisputeApiResponse> {
    const response = await api.post(
      `/disputes/${disputeId}/evidence`,
      evidenceData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return flattenResponse(response.data);
  },

  // Get user's disputes
  async getUserDisputes(
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    },
    token?: string
  ): Promise<DisputesApiResponse> {
    const response = await api.get('/disputes', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return flattenResponse(response.data);
  },

  // Get all disputes (Admin only)
  async getAllDisputes(
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      priority?: string;
    },
    token?: string
  ): Promise<DisputesApiResponse> {
    const response = await api.get('/disputes/admin/all', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return flattenResponse(response.data);
  },

  // Resolve dispute (Admin only)
  async resolveDispute(
    disputeId: string,
    resolutionData: {
      decision: string;
      refundAmount?: number;
      penaltyToUser?: string;
    },
    token: string
  ): Promise<DisputeApiResponse> {
    const response = await api.put(
      `/disputes/${disputeId}/resolve`,
      resolutionData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return flattenResponse(response.data);
  },
};
