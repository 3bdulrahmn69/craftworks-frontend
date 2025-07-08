import { api } from './api';

const servicesAPI = {
  getAllCategories: async (): Promise<any> => {
    const response = await api.get('/services/categories');
    return response.data;
  },
};

export default servicesAPI;
