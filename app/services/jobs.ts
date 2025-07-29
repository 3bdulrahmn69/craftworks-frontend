import { api } from './api';
import {
  Quote,
  Invitation,
  JobsApiResponse,
  JobApiResponse,
  QuoteApiResponse,
  Pagination,
} from '@/app/types/jobs';

export const jobsService = {
  // Get all jobs with optional filters
  async getJobs(
    params?: {
      category?: string;
      status?: string;
      page?: number;
      limit?: number;
      state?: string;
      city?: string;
    },
    token?: string
  ): Promise<JobsApiResponse> {
    const response = await api.get('/jobs', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  // Search jobs with optional filters
  async searchJobs(
    params?: {
      q?: string;
      category?: string;
      status?: string;
      page?: number;
      limit?: number;
      state?: string;
      city?: string;
      paymentType?: string;
    },
    token?: string
  ): Promise<JobsApiResponse> {
    const response = await api.get('/jobs/search', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  // Get job details
  async getJob(jobId: string, token?: string): Promise<JobApiResponse> {
    const response = await api.get(`/jobs/${jobId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  // Submit a quote for a job (craftsman only)
  async submitQuote(
    jobId: string,
    quoteData: { price: number; notes?: string },
    token: string
  ): Promise<QuoteApiResponse> {
    const response = await api.post(`/jobs/${jobId}/quotes`, quoteData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Get quotes for a job (client only)
  async getJobQuotes(
    jobId: string,
    token: string
  ): Promise<{ success: boolean; data: Quote[] }> {
    const response = await api.get(`/jobs/${jobId}/quotes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Accept a quote (client only)
  async acceptQuote(
    jobId: string,
    quoteId: string,
    token: string
  ): Promise<any> {
    const response = await api.post(
      `/jobs/${jobId}/quotes/${quoteId}/accept`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};

export const quotesService = {
  // Get craftsman's quotes
  async getMyQuotes(
    queryParams: string,
    token?: string
  ): Promise<{ data: Quote[]; pagination: Pagination }> {
    const response = await api.get(`/users/me/quotes?${queryParams}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};

export const invitationsService = {
  // Get craftsman's invitations
  async getMyInvitations(
    queryParams: string,
    token?: string
  ): Promise<{ data: Invitation[]; pagination: Pagination }> {
    const response = await api.get(`/users/me/invitations?${queryParams}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  // Respond to an invitation
  async respondToInvitation(
    invitationId: string,
    response: 'accept' | 'reject',
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const apiResponse = await api.post(
      `/invitations/${invitationId}/${response}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return apiResponse.data;
  },
};
