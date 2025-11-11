import api from './api';

export const seriesRatingsService = {
  async getSeriesRating(seriesId) {
    const response = await api.get(`/series/${seriesId}/ratings`);
    return response.data;
  },

  async getMyRating(seriesId) {
    const response = await api.get(`/series/${seriesId}/ratings/my`);
    return response.data;
  },

  async getMyRatings() {
    const response = await api.get('/series/ratings/my/all');
    return response.data;
  },

  async rateSeries(seriesId, value) {
    const response = await api.post(`/series/${seriesId}/ratings`, { value });
    return response.data;
  },
};

