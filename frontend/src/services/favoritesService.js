import api from './api';

export const favoritesService = {
  async getFavorites(page = 1, pageSize = 10) {
    const response = await api.get('/favorites', {
      params: { page, pageSize },
    });
    return response.data;
  },

  async addToFavorites(movieId) {
    const response = await api.post(`/favorites/${movieId}`);
    return response.data;
  },

  async removeFromFavorites(movieId) {
    const response = await api.delete(`/favorites/${movieId}`);
    return response.data;
  },
};

