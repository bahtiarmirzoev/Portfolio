import api from './api';

export const moviesService = {
  async getAll(params = {}) {
    const response = await api.get('/movies', { params });
    return response.data;
  },

  async getById(idOrSlug) {
    const response = await api.get(`/movies/${idOrSlug}`);
    return response.data;
  },

  async search(query, skip = 0, take = 10) {
    const response = await api.get('/movies', {
      params: { search: query, skip, take },
    });
    return response.data;
  },
};

