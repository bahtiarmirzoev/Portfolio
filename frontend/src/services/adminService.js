import api from './api';

export const adminService = {
  async createMovie(movieData) {
    const response = await api.post('/movies', movieData);
    return response.data;
  },

  async updateMovie(id, movieData) {
    const response = await api.put(`/movies/${id}`, movieData);
    return response.data;
  },

  async deleteMovie(id) {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
  },

  async createSeries(seriesData) {
    const response = await api.post('/series', seriesData);
    return response.data;
  },

  async updateSeries(id, seriesData) {
    const response = await api.put(`/series/${id}`, seriesData);
    return response.data;
  },

  async deleteSeries(id) {
    const response = await api.delete(`/series/${id}`);
    return response.data;
  },

  async createActor(actorData) {
    const response = await api.post('/actors', actorData);
    return response.data;
  },

  async updateActor(id, actorData) {
    const response = await api.put(`/actors/${id}`, actorData);
    return response.data;
  },
};

