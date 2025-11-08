import api from './api';

export const actorsService = {
  async getAll({
    page = 1,
    pageSize = 60,
    search = '',
    sortBy = 'name',
    sortOrder = 'asc',
  } = {}) {
    const response = await api.get('/actors', {
      params: {
        Page: page,
        PageSize: pageSize,
        Search: search || undefined,
        SortBy: sortBy,
        SortOrder: sortOrder,
      },
    });

    const data = response.data;

    if (Array.isArray(data)) {
      return { items: data, total: data.length, raw: data };
    }

    if (data && Array.isArray(data.items)) {
      return {
        items: data.items,
        total: data.totalCount ?? data.items.length,
        raw: data,
      };
    }

    if (data && Array.isArray(data.data)) {
      return {
        items: data.data,
        total: data.totalCount ?? data.total ?? data.data.length,
        raw: data,
      };
    }

    return { items: [], total: 0, raw: data };
  },

  async search({ name, page = 1, pageSize = 50 } = {}) {
    if (!name) {
      return { items: [], total: 0, raw: null };
    }

    const response = await api.get('/actors/search', {
      params: {
        name,
        page,
        pageSize,
      },
    });

    const data = response.data;

    if (Array.isArray(data)) {
      return { items: data, total: data.length, raw: data };
    }

    if (data && Array.isArray(data.items)) {
      return {
        items: data.items,
        total: data.totalCount ?? data.items.length,
        raw: data,
      };
    }

    if (data && Array.isArray(data.data)) {
      return {
        items: data.data,
        total: data.totalCount ?? data.total ?? data.data.length,
        raw: data,
      };
    }

    return { items: [], total: 0, raw: data };
  },

  async getById(id) {
    const response = await api.get(`/actors/${id}`);
    return response.data;
  },
};

