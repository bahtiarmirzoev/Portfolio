import api from './api';

export const actorsService = {
  async getAll() {
    const response = await api.get('/actors');
    return response.data;
  },
};

