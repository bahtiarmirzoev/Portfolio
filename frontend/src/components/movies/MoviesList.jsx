import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { moviesService } from '../../services/moviesService';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiFilm, FiSearch, FiFilter, FiX, FiGrid, FiList, FiChevronDown, FiStar, FiArrowUp, FiArrowDown, FiCalendar, FiClock, FiCheck } from 'react-icons/fi';
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
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: 'default', label: t('sortDefault') },
    { value: 'year', label: t('sortYear') },
    { value: 'rating', label: t('sortRating') },
    { value: 'title', label: t('sortTitle') },
  ];

  const activeSort = sortOptions.find((option) => option.value === sortBy) || sortOptions[0];

  const filterChips = [
    searchQuery && { key: 'search', label: t('search'), value: searchQuery },
    filters.genre && { key: 'genre', label: t('genre'), value: filters.genre },
    filters.yearFrom && { key: 'yearFrom', label: t('yearFrom'), value: filters.yearFrom },
    filters.yearTo && { key: 'yearTo', label: t('yearTo'), value: filters.yearTo },
    filters.actor && { key: 'actor', label: t('actor'), value: filters.actor },
  ].filter(Boolean);

  const removeFilterChip = (key) => {
    if (key === 'search') {
      setSearchQuery('');
      const params = Object.fromEntries(searchParams.entries());
      delete params.search;
      setSearchParams(params);
      setPage(1);
      return;
    }

    handleFilterChange(key, '');
  };

  const heroStats = [
    {
      label: t('total') || 'Всего',
      value: movies.length,
      caption: t('movies') || 'Movies',
    },
    {
      label: t('filters') || 'Фильтры',
      value: filterChips.length,
      caption: t('search') || 'Search',
    },
    {
      label: t('sortBy') || 'Сортировка',
      value: activeSort.label,
      caption: '',
    },
  ];

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
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_0_80px_rgba(255,255,255,0.05)] backdrop-blur-3xl md:px-10 md:py-12"
        >
          <motion.span
            className="pointer-events-none absolute -right-24 top-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent blur-[120px]"
            animate={{ x: [0, 18, 0], y: [0, -12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="pointer-events-none absolute -left-16 bottom-[-20%] h-72 w-72 rounded-full bg-gradient-to-tl from-white/15 via-transparent to-transparent blur-[120px]"
            animate={{ x: [0, -12, 0], y: [0, 10, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />

          <div className="relative z-10 space-y-10">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-4">
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/50"
                >
                  {t('catalog')}
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  className="text-4xl font-semibold text-white tracking-tight sm:text-5xl"
                >
                  {t('movies')}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-white/60 text-base sm:text-lg"
                >
                  {(t('moviesDesc') || t('catalog')) ?? 'Каталог фильмов'}
                </motion.p>
              </div>

              <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {heroStats.map((stat, idx) => (
                  <motion.div
                    key={`${stat.label}-${idx}`}
                    whileHover={{ translateY: -6, scale: 1.02 }}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 px-4 py-5"
                  >
                    <div className="text-xs uppercase tracking-[0.3em] text-white/40">{stat.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{stat.value}</div>
                    {stat.caption && (
                      <p className="mt-1 text-xs text-white/40 truncate">{stat.caption}</p>
                    )}
                    <motion.span
                      className="pointer-events-none absolute -right-6 -top-10 h-16 w-16 rounded-full bg-white/10"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 14 + idx * 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <form onSubmit={handleSearch} className="relative flex-1">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-12 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0"
                  placeholder={t('searchPlaceholder')}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg hover:bg-white/90"
                >
                  {t('search')}
                </motion.button>
              </form>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/30 p-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={`rounded-xl px-3 py-2 transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <FiGrid size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('list')}
                    className={`rounded-xl px-3 py-2 transition-colors ${
                      viewMode === 'list' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <FiList size={18} />
                  </motion.button>
                </div>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
                  >
                    {(activeSort.value === 'year' || activeSort.value === 'rating') ? <FiArrowDown /> : <FiArrowUp />}
                    <span>{activeSort.label}</span>
                    <FiChevronDown className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-black/80 p-2 backdrop-blur-2xl"
                      >
                        {sortOptions.map((option) => {
                          const isActive = option.value === sortBy;
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSortBy(option.value);
                                setPage(1);
                                setShowSortMenu(false);
                              }}
                              className={`w-full rounded-xl px-4 py-2 text-left text-sm transition-colors ${
                                isActive
                                  ? 'bg-white text-black shadow-lg'
                                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option.label}</span>
                                {isActive && <FiCheck className="text-xs" />}
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm transition-colors ${
                    showFilters ? 'bg-white text-black shadow-lg' : 'bg-black/40 text-white/70 hover:text-white'
                  }`}
                >
                  <FiFilter /> {t('filters')}
                </motion.button>
              </div>
            </div>

            {filterChips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-wrap items-center gap-2"
              >
                {filterChips.map((chip) => (
                  <motion.button
                    key={`${chip.key}-${chip.value}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeFilterChip(chip.key)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70 hover:border-white/40 hover:text-white"
                  >
                    <span className="font-semibold text-white/80">{chip.label}:</span>
                    <span>{chip.value}</span>
                    <FiX className="text-white/50" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.section>

        <AnimatePresence>
          {showFilters && (
            <motion.section
              key="filters"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-2xl"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">{t('genre')}</span>
                  <input
                    type="text"
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0"
                    placeholder="Drama, Comedy..."
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">{t('yearFrom')}</span>
                  <input
                    type="number"
                    value={filters.yearFrom}
                    onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0"
                    placeholder="2000"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">{t('yearTo')}</span>
                  <input
                    type="number"
                    value={filters.yearTo}
                    onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0"
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">{t('actor')}</span>
                  <input
                    type="text"
                    value={filters.actor}
                    onChange={(e) => handleFilterChange('actor', e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0"
                    placeholder="Имя актёра"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  <FiX /> {t('resetFilters') || 'Очистить'}
                </motion.button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Movies Grid */}
        {loading && movies.length === 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-4'
            }
          >
            {Array.from({ length: 8 }).map((_, i) => (
              viewMode === 'grid' ? (
                <div
                  key={i}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
                >
                  <div className="mb-4 aspect-[2/3] rounded-2xl bg-white/10 animate-pulse" />
                  <div className="mb-2 h-6 rounded bg-white/10 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-white/10 animate-pulse" />
                </div>
              ) : (
                <div
                  key={i}
                  className="flex gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
                >
                  <div className="h-48 w-32 flex-shrink-0 rounded-2xl bg-white/10 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 rounded bg-white/10 animate-pulse" />
                    <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse" />
                    <div className="h-4 rounded bg-white/10 animate-pulse" />
                  </div>
                </div>
              )
            ))}
          </div>
        ) : movies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-12 text-center backdrop-blur-2xl"
          >
            <motion.span
              className="pointer-events-none absolute -right-16 -top-10 h-44 w-44 rounded-full bg-white/10"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <FiFilm className="mx-auto text-6xl text-white/20 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{t('notFound')}</h2>
            <p className="text-white/60">{t('tryDifferentSearch')}</p>
          </motion.div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {movies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.6, ease: 'easeOut' }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl shadow-[0_0_60px_rgba(255,255,255,0.05)] transition-all"
                  >
                    <motion.span
                      className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-white/10"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    />
                    <Link to={`/movies/${movie.id}`} className="relative z-10 flex flex-col gap-4">
                      <div className="relative overflow-hidden rounded-2xl">
                        <div className="aspect-[2/3] overflow-hidden rounded-2xl">
                          {movie.posterUrl ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-black/40">
                              <FiFilm className="text-white/20 text-5xl" />
                            </div>
                          )}
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        {movie.averageRating && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                            <FiStar className="text-yellow-400" />
                            {movie.averageRating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3
                            className="text-lg font-semibold text-white transition-colors group-hover:text-white/80"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {movie.title}
                          </h3>
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/60">
                            <FiCalendar className="opacity-70" />
                            {movie.year}
                          </span>
                        </div>

                        {movie.description && (
                          <p
                            className="text-sm text-white/60"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {movie.description}
                          </p>
                        )}

                        {movie.genres && movie.genres.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {movie.genres.slice(0, 3).map((genre, idx) => (
                              <span
                                key={idx}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
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
            ) : (
              <div className="space-y-4">
                {movies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.6, ease: 'easeOut' }}
                    whileHover={{ x: 5 }}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
                  >
                    <Link to={`/movies/${movie.id}`} className="flex flex-col gap-4 md:flex-row md:items-stretch">
                      <div className="relative w-full overflow-hidden rounded-2xl md:w-44">
                        <div className="aspect-[2/3] overflow-hidden rounded-2xl">
                          {movie.posterUrl ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-black/40">
                              <FiFilm className="text-white/20 text-4xl" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-2xl font-semibold text-white transition-colors group-hover:text-white/80">
                              {movie.title}
                            </h3>
                            {movie.averageRating && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                                <FiStar className="text-yellow-400" />
                                {movie.averageRating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                            <span className="inline-flex items-center gap-1">
                              <FiCalendar className="opacity-70" />
                              {movie.year}
                            </span>
                            {movie.runtime && (
                              <span className="inline-flex items-center gap-1">
                                <FiClock className="opacity-70" />
                                {movie.runtime}
                              </span>
                            )}
                          </div>
                          {movie.description && (
                            <p
                              className="text-sm text-white/60"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {movie.description}
                            </p>
                          )}
                        </div>

                        {movie.genres && movie.genres.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {movie.genres.map((genre, idx) => (
                              <span
                                key={idx}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
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

