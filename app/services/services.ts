import { api } from './api';
import { ServicesApiResponse } from '../types/jobs';

const servicesAPI = {
  getAllServices: async (token?: string): Promise<ServicesApiResponse> => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const response = await api.get<ServicesApiResponse>('/services', config);
    return response.data;
  },

  // Keep legacy method for backward compatibility
  getAllCategories: async (token?: string): Promise<any> => {
    const response = await servicesAPI.getAllServices(token);
    return response.data;
  },
};

export default servicesAPI;
