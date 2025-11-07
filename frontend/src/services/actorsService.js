import api from './api';

export const actorsService = {
  async getAll(sortBy = 'name', sortOrder = 'asc') {
    const response = await api.get('/actors', {
      params: { sortBy, sortOrder }
    });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/actors/${id}`);
    return response.data;
  },
};

