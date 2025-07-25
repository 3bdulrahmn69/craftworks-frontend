import { api } from './api';
import { ApiResponse } from '../types/user';

const servicesAPI = {
  getAllCategories: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/services/categories');
    return response.data.data;
  },
};

export default servicesAPI;
