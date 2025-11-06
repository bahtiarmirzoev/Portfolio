import api from './api';

export const ratingsService = {
  async getMovieRating(movieId) {
    const response = await api.get(`/movies/${movieId}/ratings`);
    return response.data;
  },

  async rateMovie(movieId, value) {
    const response = await api.post(`/movies/${movieId}/ratings`, { value });
    return response.data;
  },
};

