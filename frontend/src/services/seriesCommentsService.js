import api from './api';

export const seriesCommentsService = {
  async getSeriesComments(seriesId) {
    const response = await api.get(`/series/${seriesId}/comments`);
    return response.data;
  },

  async getComment(seriesId, commentId) {
    const response = await api.get(`/series/${seriesId}/comments/${commentId}`);
    return response.data;
  },

  async createComment(seriesId, content) {
    const response = await api.post(`/series/${seriesId}/comments`, { content });
    return response.data;
  },

  async updateComment(seriesId, commentId, content) {
    const response = await api.put(`/series/${seriesId}/comments/${commentId}`, { content });
    return response.data;
  },

  async deleteComment(seriesId, commentId) {
    const response = await api.delete(`/series/${seriesId}/comments/${commentId}`);
    return response.data;
  },
};

