import api from './api';

export const ratingsService = {
  async getMovieRating(movieId) {
    const response = await api.get(`/movies/${movieId}/ratings`);
    return response.data;
  },

  async getMyRating(movieId) {
    const response = await api.get(`/movies/${movieId}/ratings/my`);
    return response.data;
  },

  async rateMovie(movieId, value) {
    const response = await api.post(`/movies/${movieId}/ratings`, { value });
    return response.data;
  },

  async getMyRatings() {
    const response = await api.get('/ratings/my');
    return response.data;
  },
};

