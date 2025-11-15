import api from './api';

export const favoritesService = {
  async getFavorites(page = 1, pageSize = 10) {
    const response = await api.get('/favorites/movies', {
      params: { page, pageSize },
    });
    return response.data;
  },

  async addToFavorites(movieId) {
    const response = await api.post(`/favorites/movies/${movieId}`);
    return response.data;
  },

  async removeFromFavorites(movieId) {
    const response = await api.delete(`/favorites/movies/${movieId}`);
    return response.data;
  },

  async getFavoriteSeries(page = 1, pageSize = 10) {
    const response = await api.get('/favorites/series', {
      params: { page, pageSize },
    });
    return response.data;
  },

  async addSeriesToFavorites(seriesId) {
    const response = await api.post(`/favorites/series/${seriesId}`);
    return response.data;
  },

  async removeSeriesFromFavorites(seriesId) {
    const response = await api.delete(`/favorites/series/${seriesId}`);
    return response.data;
  },
};

