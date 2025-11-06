import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { moviesService } from '../../services/moviesService';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiFilm, FiSearch, FiFilter, FiX, FiGrid, FiList, FiChevronDown, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MoviesList = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'year', 'rating', 'title'
  const [filters, setFilters] = useState({
    genre: '',
    yearFrom: '',
    yearTo: '',
    actor: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
    loadMovies();
  }, [page, searchQuery, filters, sortBy, searchParams]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const params = {
        skip: (page - 1) * pageSize,
        take: pageSize,
      };

      if (searchQuery) {
        params.search = searchQuery;
      } else {
        if (filters.genre) params.genre = filters.genre;
        if (filters.yearFrom) params.yearFrom = parseInt(filters.yearFrom);
        if (filters.yearTo) params.yearTo = parseInt(filters.yearTo);
        if (filters.actor) params.actor = filters.actor;
      }

      const response = await moviesService.getAll(params);
      // Проверяем структуру ответа - может быть массив или объект с items
      let newMovies = Array.isArray(response) ? response : (response?.items || []);

      // Сортировка
      if (sortBy === 'year') {
        newMovies = [...newMovies].sort((a, b) => b.year - a.year);
      } else if (sortBy === 'rating') {
        newMovies = [...newMovies].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      } else if (sortBy === 'title') {
        newMovies = [...newMovies].sort((a, b) => a.title.localeCompare(b.title));
      }

      if (page === 1) {
        setMovies(newMovies);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
      }

      setHasMore(newMovies.length === pageSize);
    } catch (error) {
      toast.error(t('errorLoadingMovies'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ search: searchQuery });
    loadMovies();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      yearFrom: '',
      yearTo: '',
      actor: '',
    });
    setSearchQuery('');
    setPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold text-white mb-2"
              >
                {t('movies')}
              </motion.h1>
              <p className="text-white/60">{t('catalog')}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <FiGrid size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <FiList size={20} />
                </motion.button>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                >
                  <option value="default" className="bg-gray-900">{t('sortDefault')}</option>
                  <option value="year" className="bg-gray-900">{t('sortYear')}</option>
                  <option value="rating" className="bg-gray-900">{t('sortRating')}</option>
                  <option value="title" className="bg-gray-900">{t('sortTitle')}</option>
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none" />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-white/20' : ''}`}
              >
                <FiFilter /> {t('filters')}
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
                placeholder={t('searchPlaceholder')}
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
            >
              {t('search')}
            </motion.button>
          </form>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 pt-6 border-t border-white/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    {t('genre')}
                  </label>
                  <input
                    type="text"
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="input-field"
                    placeholder={t('genre')}
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    {t('yearFrom')}
                  </label>
                  <input
                    type="number"
                    value={filters.yearFrom}
                    onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                    className="input-field"
                    placeholder="2000"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    {t('yearTo')}
                  </label>
                  <input
                    type="number"
                    value={filters.yearTo}
                    onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                    className="input-field"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    {t('actor')}
                  </label>
                  <input
                    type="text"
                    value={filters.actor}
                    onChange={(e) => handleFilterChange('actor', e.target.value)}
                    className="input-field"
                    placeholder="Имя актёра"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiX /> Очистить
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* Movies Grid */}
        {loading && movies.length === 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {Array.from({ length: 8 }).map((_, i) => (
              viewMode === 'grid' ? (
                <div key={i} className="card animate-pulse">
                  <div className="w-full aspect-[2/3] bg-white/10 rounded-lg mb-4"></div>
                  <div className="h-6 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-2/3"></div>
                </div>
              ) : (
                <div key={i} className="card animate-pulse flex gap-6">
                  <div className="w-32 h-48 bg-white/10 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    <div className="h-4 bg-white/10 rounded"></div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : movies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <FiFilm className="mx-auto text-6xl text-white/20 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{t('notFound')}</h2>
            <p className="text-white/60">{t('tryDifferentSearch')}</p>
          </motion.div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {movies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.6, ease: "easeOut" }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          className="card group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                          <Link to={`/movies/${movie.id}`} className="block relative z-10">
                      {movie.posterUrl ? (
                        <div className="relative overflow-hidden rounded-lg mb-4 aspect-[2/3]">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              {movie.averageRating && (
                                <div className="flex items-center gap-1 mb-2">
                                  <FiStar className="text-yellow-400 fill-yellow-400" size={16} />
                                  <span className="text-white font-semibold">{movie.averageRating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-[2/3] bg-white/5 rounded-lg mb-4 flex items-center justify-center">
                          <FiFilm className="text-white/20 text-6xl" />
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-white/80 transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-white/60">{movie.year}</span>
                        {movie.averageRating && (
                          <span className="text-white/80 flex items-center gap-1">
                            <FiStar className="text-yellow-400" size={14} />
                            {movie.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {movie.genres && movie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {movie.genres.slice(0, 2).map((genre, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-white/10 rounded text-white/60"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {movies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.6, ease: "easeOut" }}
                            whileHover={{ x: 5, scale: 1.01 }}
                            className="card group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                            <Link to={`/movies/${movie.id}`} className="flex gap-6 relative z-10">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-32 h-48 object-cover rounded-lg flex-shrink-0 group-hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-32 h-48 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiFilm className="text-white/20 text-4xl" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-white/80 transition-colors">
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-4 mb-3 text-white/60">
                          <span>{movie.year}</span>
                          {movie.averageRating && (
                            <span className="flex items-center gap-1 text-white/80">
                              <FiStar className="text-yellow-400" size={16} />
                              {movie.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {movie.description && (
                          <p className="text-white/70 mb-3 line-clamp-2">{movie.description}</p>
                        )}
                        {movie.genres && movie.genres.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {movie.genres.map((genre, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-3 py-1 bg-white/10 rounded-full text-white/60"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? t('loading') : t('loadMore')}
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MoviesList;

