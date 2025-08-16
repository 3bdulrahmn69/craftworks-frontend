import { api } from './api';
import {
  Invitation,
  JobsApiResponse,
  JobApiResponse,
  QuoteApiResponse,
  JobApplicationsApiResponse,
  Pagination,
} from '@/app/types/jobs';

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
    return flattenResponse(response.data);
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
    return flattenResponse(response.data);
  },

  // Get job details
  async getJob(jobId: string, token?: string): Promise<JobApiResponse> {
    const response = await api.get(`/jobs/${jobId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return flattenResponse(response.data);
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
    return flattenResponse(response.data);
  },

  // Get quotes for a job (client only)
  async getJobQuotes(
    jobId: string,
    token: string
  ): Promise<JobApplicationsApiResponse> {
    const response = await api.get(`/jobs/${jobId}/quotes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return flattenResponse(response.data);
  },

  // Accept a quote (client only)
  async acceptQuote(
    jobId: string,
    quoteId: string,
    token: string
  ): Promise<any> {
    const response = await api.put(
      `/jobs/${jobId}/quotes/${quoteId}/accept`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return flattenResponse(response.data);
  },

  async rejectQuote(
    jobId: string,
    quoteId: string,
    token: string
  ): Promise<any> {
    const response = await api.put(
      `/jobs/${jobId}/quotes/${quoteId}/reject`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return flattenResponse(response.data);
  },

  // Create a new job (client only)
  async createJob(
    jobData: FormData | object,
    token: string
  ): Promise<JobApiResponse> {
    const headers: any = {
      Authorization: `Bearer ${token}`,
    };

    // For FormData, don't set Content-Type (let browser set it with boundary)
    // For regular objects, set Content-Type to application/json
    if (!(jobData instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await api.post('/jobs', jobData, { headers });
    return flattenResponse(response.data);
  },

  // Get jobs created by the current user (client only)
  async getMyJobs(
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    },
    token?: string
  ): Promise<JobsApiResponse> {
    const response = await api.get('/users/me/jobs', {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return flattenResponse(response.data);
  },

  // Update a job (client only)
  async updateJob(
    jobId: string,
    jobData: FormData | object,
    token: string
  ): Promise<JobApiResponse> {
    const headers: any = {
      Authorization: `Bearer ${token}`,
    };

    // For FormData, don't set Content-Type (let browser set it with boundary)
    // For regular objects, set Content-Type to application/json
    if (!(jobData instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await api.put(`/jobs/${jobId}`, jobData, { headers });
    return flattenResponse(response.data);
  },

  // Delete a job (client only)
  async deleteJob(
    jobId: string,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return flattenResponse(response.data);
  },

  // Cancel a job (client only)
  async cancelJob(
    jobId: string,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(
      `/jobs/${jobId}/status`,
      { status: 'Cancelled' },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return flattenResponse(response.data);
  },

  // Update job status (Enhanced with role-based transitions)
  async updateJobStatus(
    jobId: string,
    statusData: {
      status: 'On The Way' | 'Completed' | 'Cancelled' | 'Rescheduled';
      newJobDate?: string; // Required for Rescheduled status
    },
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/jobs/${jobId}/status`, statusData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return flattenResponse(response.data);
  },

  // Update job date (Client only)
  async updateJobDate(
    jobId: string,
    jobDate: string,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(
      `/jobs/${jobId}/date`,
      { jobDate },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return flattenResponse(response.data);
  },

  // Invite a craftsman to a job (client only)
  async inviteCraftsman(
    jobId: string,
    craftsmanId: string,
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(
      `/jobs/${jobId}/invite`,
      { craftsmanId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return flattenResponse(response.data);
  },
};

export const quotesService = {
  // Get craftsman's quotes
  async getMyQuotes(queryParams: string, token?: string): Promise<any> {
    const response = await api.get(`/users/me/quotes?${queryParams}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return flattenResponse(response.data);
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
    return flattenResponse(response.data);
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
    return flattenResponse(apiResponse.data);
  },

  // New direct response to job invitation
  async respondToJobInvitation(
    jobId: string,
    response: 'Accepted' | 'Rejected',
    token: string
  ): Promise<{ success: boolean; message: string }> {
    const apiResponse = await api.post(
      `/jobs/${jobId}/invitations/respond`,
      { response },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return flattenResponse(apiResponse.data);
  },
};
