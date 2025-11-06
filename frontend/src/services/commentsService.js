import api from './api';

export const commentsService = {
  async getMovieComments(movieId) {
    const response = await api.get(`/movies/${movieId}/comments`);
    return response.data;
  },

  async getComment(movieId, commentId) {
    const response = await api.get(`/movies/${movieId}/comments/${commentId}`);
    return response.data;
  },

  async createComment(movieId, content) {
    const response = await api.post(`/movies/${movieId}/comments`, { content });
    return response.data;
  },

  async updateComment(movieId, commentId, content) {
    const response = await api.put(`/movies/${movieId}/comments/${commentId}`, { content });
    return response.data;
  },

  async deleteComment(movieId, commentId) {
    const response = await api.delete(`/movies/${movieId}/comments/${commentId}`);
    return response.data;
  },
};

