import { create } from 'zustand';
import { adminService } from '../services/adminService';
import { moviesService } from '../services/moviesService';
import { seriesService } from '../services/seriesService';
import { actorsService } from '../services/actorsService';

export const useAdminStore = create((set, get) => ({
  movies: [],
  series: [],
  actors: [],
  loading: false,
  error: null,
  activeTab: 'movies',
  showCreateModal: false,
  showEditModal: false,
  editingItem: null,
  posterUploadLoading: false,
  posterUploadError: '',

  // Movies form
  movieForm: {
    title: '',
    year: new Date().getFullYear(),
    description: '',
    posterUrl: '',
    trailerUrl: '',
    genres: [],
    actors: [],
  },

  // Series form
  seriesForm: {
    title: '',
    yearOfRelease: new Date().getFullYear(),
    yearOfEnd: null,
    description: '',
    posterUrl: '',
    trailerUrl: '',
    genres: [],
    actors: [],
    totalSeasons: null,
    totalEpisodes: null,
    isOngoing: false,
  },

  // Actor form
  actorForm: {
    name: '',
    dateOfBirth: '',
    biography: '',
  },

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowCreateModal: (show) => set({ showCreateModal: show }),
  setShowEditModal: (show) => set({ showEditModal: show }),
  setEditingItem: (item) => set({ editingItem: item }),
  setPosterUploadLoading: (loading) => set({ posterUploadLoading: loading }),
  setPosterUploadError: (error) => set({ posterUploadError: error }),

  setMovieForm: (form) => set({ movieForm: form }),
  setSeriesForm: (form) => set({ seriesForm: form }),
  setActorForm: (form) => set({ actorForm: form }),

  loadMovies: async () => {
    set({ loading: true, error: null });
    try {
      const data = await moviesService.getAll({ take: 1000 });
      const movies = Array.isArray(data) ? data : data?.items || data?.data || [];
      set({ movies, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadSeries: async () => {
    set({ loading: true, error: null });
    try {
      const data = await seriesService.getAll({ take: 1000 });
      const series = Array.isArray(data) ? data : data?.items || data?.data || [];
      set({ series, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadActors: async () => {
    set({ loading: true, error: null });
    try {
      const result = await actorsService.getAll({ page: 1, pageSize: 1000 });
      set({ actors: result.items, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createMovie: async (movieData) => {
    try {
      const movie = await adminService.createMovie(movieData);
      set((state) => ({ movies: [...state.movies, movie] }));
      return movie;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateMovie: async (id, movieData) => {
    try {
      const updated = await adminService.updateMovie(id, movieData);
      set((state) => ({
        movies: state.movies.map((m) => (m.id === id ? updated : m)),
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteMovie: async (id) => {
    try {
      await adminService.deleteMovie(id);
      set((state) => ({
        movies: state.movies.filter((m) => m.id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  createSeries: async (seriesData) => {
    try {
      const series = await adminService.createSeries(seriesData);
      set((state) => ({ series: [...state.series, series] }));
      return series;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateSeries: async (id, seriesData) => {
    try {
      const updated = await adminService.updateSeries(id, seriesData);
      set((state) => ({
        series: state.series.map((s) => (s.id === id ? updated : s)),
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteSeries: async (id) => {
    try {
      await adminService.deleteSeries(id);
      set((state) => ({
        series: state.series.filter((s) => s.id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  createActor: async (actorData) => {
    try {
      const actor = await adminService.createActor(actorData);
      set((state) => ({ actors: [...state.actors, actor] }));
      return actor;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateActor: async (id, actorData) => {
    try {
      const updated = await adminService.updateActor(id, actorData);
      set((state) => ({
        actors: state.actors.map((a) => (a.id === id ? updated : a)),
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  resetMovieForm: () => set({
    movieForm: {
      title: '',
      year: new Date().getFullYear(),
      description: '',
      posterUrl: '',
      trailerUrl: '',
      genres: [],
      actors: [],
    },
    posterUploadError: '',
  }),

  resetSeriesForm: () => set({
    seriesForm: {
      title: '',
      yearOfRelease: new Date().getFullYear(),
      yearOfEnd: null,
      description: '',
      posterUrl: '',
      trailerUrl: '',
      genres: [],
      actors: [],
      totalSeasons: null,
      totalEpisodes: null,
      isOngoing: false,
    },
    posterUploadError: '',
  }),

  resetActorForm: () => set({
    actorForm: {
      name: '',
      dateOfBirth: '',
      biography: '',
    },
  }),

  reset: () => set({
    movies: [],
    series: [],
    actors: [],
    loading: false,
    error: null,
    activeTab: 'movies',
    showCreateModal: false,
    showEditModal: false,
    editingItem: null,
    posterUploadLoading: false,
    posterUploadError: '',
    movieForm: {
      title: '',
      year: new Date().getFullYear(),
      description: '',
      posterUrl: '',
      trailerUrl: '',
      genres: [],
      actors: [],
    },
    seriesForm: {
      title: '',
      yearOfRelease: new Date().getFullYear(),
      yearOfEnd: null,
      description: '',
      posterUrl: '',
      trailerUrl: '',
      genres: [],
      actors: [],
      totalSeasons: null,
      totalEpisodes: null,
      isOngoing: false,
    },
    actorForm: {
      name: '',
      dateOfBirth: '',
      biography: '',
    },
  }),
}));

