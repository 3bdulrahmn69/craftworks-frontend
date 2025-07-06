import { api } from './api';

const servicesService = {
  getAllCategories: async (): Promise<any> => {
    const response = await api.get('/services/categories');
    return response.data;
  },
};

export default servicesService;
