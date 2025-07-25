import { api } from './api';
import { ApiResponse } from '../types/user';

const servicesAPI = {
  getAllCategories: async (token?: string): Promise<any> => {
    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const response = await api.get<ApiResponse<any>>('/services', config);
    return response.data.data;
  },
};

export default servicesAPI;
