import api from './api';

export const seriesService = {
  async getAll(params = {}) {
    const response = await api.get('/series', { params });
    return response.data;
  },

  async getById(idOrSlug) {
    const response = await api.get(`/series/${idOrSlug}`);
    return response.data;
  },

  async getOngoing(params = {}) {
    const response = await api.get('/series/ongoing', { params });
    return response.data;
  },

  async search(query, skip = 0, take = 10) {
    const response = await api.get('/series', {
      params: { search: query, skip, take },
    });
    return response.data;
  },
};

