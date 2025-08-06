import { api } from './api';
import { ServicesApiResponse, Service } from '../types/jobs';

// Helper function to get localized service name
export const getServiceName = (service: Service, locale: string): string => {
  if (typeof service.name === 'string') {
    return service.name;
  }
  return service.name[locale as 'en' | 'ar'] || service.name.en;
};

// Helper function to get localized service description
export const getServiceDescription = (
  service: Service,
  locale: string
): string => {
  if (typeof service.description === 'string') {
    return service.description;
  }
  return service.description[locale as 'en' | 'ar'] || service.description.en;
};

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
  getAllServices: async (lang?: string): Promise<ServicesApiResponse> => {
    // Note: According to backend manual, /api/services is public and doesn't require auth
    const queryParams = lang ? `?lang=${lang}` : '';
    const response = await api.get<ServicesApiResponse>(
      `/services${queryParams}`
    );
    return flattenResponse(response.data);
  },
};

export default servicesAPI;
