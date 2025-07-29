import { api } from './api';
import { ServicesApiResponse } from '../types/jobs';

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

const servicesAPI = {
  getAllServices: async (): Promise<ServicesApiResponse> => {
    // Note: According to backend manual, /api/services is public and doesn't require auth
    const response = await api.get<ServicesApiResponse>('/services');
    return flattenResponse(response.data);
  },
};

export default servicesAPI;
