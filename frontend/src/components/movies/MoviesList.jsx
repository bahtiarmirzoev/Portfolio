import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { moviesService } from '../../services/moviesService';
import { useLanguageStore } from '../../stores/languageStore';
import { FiFilm, FiSearch, FiFilter, FiX, FiGrid, FiList, FiChevronDown, FiStar, FiArrowUp, FiArrowDown, FiCalendar, FiClock, FiCheck, FiPlay, FiExternalLink, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MoviesList = () => {
  const { t, translateGenre } = useLanguageStore();
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
  const [totalMovies, setTotalMovies] = useState(0);
  const pageSize = 12;
  const [showSortMenu, setShowSortMenu] = useState(false);

  const totalPages = Math.ceil(totalMovies / pageSize);

  const sortOptions = [
    { value: 'default', label: t('sortDefault') },
    { value: 'year', label: t('sortYear') },
    { value: 'rating', label: t('sortRating') },
    { value: 'title', label: t('sortTitle') },
  ];

  const activeSort = sortOptions.find((option) => option.value === sortBy) || sortOptions[0];
  const SortDirectionIcon =
    activeSort.value === 'year' || activeSort.value === 'rating' ? FiArrowDown : FiArrowUp;

  const activeFilterChips = [
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
      value: totalMovies,
      caption: t('movies') || 'Movies',
    },
    {
      label: t('page') || 'Страница',
      value: `${page} / ${totalPages || 1}`,
    },
    {
      label: t('sortBy') || 'Сортировка',
      value: activeSort.label,
      caption: '',
    },
    {
      label: t('filters') || 'Фильтры',
      value: activeFilterChips.length,
      caption: t('active') || 'Active',
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
        page: page,
        pageSize: pageSize,
      };

      if (searchQuery) {
        params.search = searchQuery;
      } else {
        if (filters.genre) params.genre = filters.genre;
        if (filters.yearFrom) params.yearFrom = parseInt(filters.yearFrom);
        if (filters.yearTo) params.yearTo = parseInt(filters.yearTo);
        if (filters.actor) params.actor = filters.actor;
      }

      // Добавляем параметры сортировки
      if (sortBy && sortBy !== 'default') {
        params.sortBy = sortBy;
        // Для year и rating по умолчанию desc, для title - asc
        params.sortOrder = (sortBy === 'year' || sortBy === 'rating') ? 'desc' : 'asc';
      }

      const response = await moviesService.getAll(params);
      // Проверяем структуру ответа - может быть массив или объект с items
      const items = Array.isArray(response) ? response : (response?.items || []);
      
      // Получаем общее количество из ответа
      const total = response?.total ?? response?.totalCount ?? items.length;
      
      setMovies(items);
      setTotalMovies(total);
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

    const params = {};
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    setSearchParams(params);
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
    setSearchParams({});
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 flex-wrap mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setPage(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={page === 1}
          className="px-3 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronsLeft size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setPage(page - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={page === 1}
          className="px-3 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronLeft size={18} />
        </motion.button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => {
                setPage(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="text-white/40">...</span>}
          </>
        )}

        {pages.map((pageNum) => (
          <motion.button
            key={pageNum}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setPage(pageNum);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-4 py-2 border transition-colors ${
              pageNum === page
                ? 'border-white bg-white text-black'
                : 'border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {pageNum}
          </motion.button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-white/40">...</span>}
            <button
              onClick={() => {
                setPage(totalPages);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setPage(page + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={page === totalPages}
          className="px-3 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronRight size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setPage(totalPages);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          disabled={page === totalPages}
          className="px-3 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronsRight size={18} />
        </motion.button>
      </div>
    );
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
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-12"
        >
          {/* Title Section */}
          <div className="relative mb-8 pb-8 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-1 w-12 bg-white"></div>
                  <span className="text-xs uppercase tracking-[0.5em] text-white/40 font-medium">
                    {t('catalog') || 'CATALOG'}
                  </span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                  className="text-6xl md:text-7xl font-bold text-white tracking-tight"
                  style={{
                    background: 'linear-gradient(to right, #ffffff, #ffffff, rgba(255,255,255,0.7))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {t('movies') || 'MOVIES'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-white/50 text-lg font-light"
                >
                  {(t('moviesDesc') || t('catalog')) ?? 'Explore our collection'}
                </motion.p>
              </div>

              {/* Stats Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-wrap items-center gap-6 md:gap-8"
              >
                {heroStats.map((stat, idx) => (
                  <div key={`${stat.label}-${idx}`} className="text-center md:text-right">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-white/40">
                      {stat.label}
                    </div>
                    {stat.caption && (
                      <div className="text-xs text-white/30 mt-1">{stat.caption}</div>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <form
                onSubmit={handleSearch}
                className="relative flex-1 w-full lg:max-w-2xl"
              >
                <div className="relative">
                  <FiSearch className="absolute left-0 top-1/2 -translate-y-1/2 ml-4 text-white/40" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-white/20 pb-3 pl-12 pr-32 text-white placeholder-white/30 focus:border-white focus:outline-none focus:ring-0 text-lg"
                    placeholder={t('searchPlaceholder') || 'Search movies...'}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 px-6 py-2 bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
                  >
                    {t('search') || 'SEARCH'}
                  </motion.button>
                </div>
              </form>

              <div className="flex items-center gap-2 lg:ml-auto">
                <div className="flex items-center border border-white/20 bg-white/5">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-black'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <FiGrid size={18} />
                  </motion.button>
                  <div className="h-6 w-px bg-white/20"></div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-black'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
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
                    className="flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <SortDirectionIcon size={16} />
                    <span className="hidden sm:inline">{activeSort.label}</span>
                    <FiChevronDown className={`transition-transform text-xs ${showSortMenu ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full z-50 mt-2 w-56 border border-white/20 bg-black/95 backdrop-blur-xl p-1"
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
                              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                isActive
                                  ? 'bg-white text-black'
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
                  className={`flex items-center gap-2 border border-white/20 px-4 py-2 text-sm transition-colors ${
                    showFilters ? 'bg-white text-black' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FiFilter size={16} /> 
                  <span className="hidden sm:inline">{t('filters')}</span>
                </motion.button>
              </div>
            </div>

            {activeFilterChips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10"
              >
                <span className="text-xs uppercase tracking-wider text-white/40">Active:</span>
                {activeFilterChips.map((chip) => (
                  <motion.button
                    key={`${chip.key}-${chip.value}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeFilterChip(chip.key)}
                    className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70 hover:border-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium">{chip.label}:</span>
                    <span>{chip.value}</span>
                    <FiX className="text-white/50" size={12} />
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
              className="border-t border-white/10 pt-8"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/40 block">{t('genre')}</label>
                  <input
                    type="text"
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-white/20 pb-2 px-2 text-white placeholder-white/30 focus:border-white focus:outline-none focus:ring-0"
                    placeholder="Drama, Comedy..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/40 block">{t('yearFrom')}</label>
                  <input
                    type="number"
                    value={filters.yearFrom}
                    onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-white/20 pb-2 px-2 text-white placeholder-white/30 focus:border-white focus:outline-none focus:ring-0"
                    placeholder="2000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/40 block">{t('yearTo')}</label>
                  <input
                    type="number"
                    value={filters.yearTo}
                    onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-white/20 pb-2 px-2 text-white placeholder-white/30 focus:border-white focus:outline-none focus:ring-0"
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/40 block">{t('actor')}</label>
                  <input
                    type="text"
                    value={filters.actor}
                    onChange={(e) => handleFilterChange('actor', e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-white/20 pb-2 px-2 text-white placeholder-white/30 focus:border-white focus:outline-none focus:ring-0"
                    placeholder="Имя актёра"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white hover:bg-white/10"
                >
                  <FiX size={16} /> {t('resetFilters') || 'Очистить'}
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
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <FiFilm className="mx-auto text-6xl text-white/20 mb-4" />
            </motion.div>
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
                          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-sm text-white backdrop-blur-sm">
                            <FiStar className="text-yellow-400 fill-yellow-400" />
                            {movie.averageRating.toFixed(1)}
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <div className="rounded-full bg-white/20 backdrop-blur-sm p-4">
                            <FiPlay className="text-white text-2xl" />
                          </div>
                        </motion.div>
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
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/60 flex-shrink-0">
                            <FiCalendar className="opacity-70" />
                            {movie.year}
                          </span>
                        </div>

                        {movie.description && (
                          <p
                            className="text-sm text-white/60 line-clamp-3"
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
                                {translateGenre(genre)}
                              </span>
                            ))}
                          </div>
                        )}

                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (movie.watchUrl) {
                              window.open(movie.watchUrl, '_blank', 'noopener,noreferrer');
                            } else {
                              toast.error(t('watchUrlNotAvailable') || 'Ссылка для просмотра недоступна');
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`mt-2 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition-colors ${
                            movie.watchUrl 
                              ? 'bg-white/10 hover:bg-white/20' 
                              : 'bg-white/5 hover:bg-white/10 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <FiExternalLink size={16} />
                          <span>{t('watchMovie') || 'Смотреть фильм'}</span>
                        </motion.button>
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
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur-sm">
                                <FiStar className="text-yellow-400 fill-yellow-400" />
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
                            <p className="text-sm text-white/60 line-clamp-3">
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
                                {translateGenre(genre)}
                              </span>
                            ))}
                          </div>
                        )}

                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (movie.watchUrl) {
                              window.open(movie.watchUrl, '_blank', 'noopener,noreferrer');
                            } else {
                              toast.error(t('watchUrlNotAvailable') || 'Ссылка для просмотра недоступна');
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`mt-3 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors ${
                            movie.watchUrl 
                              ? 'bg-white/10 hover:bg-white/20' 
                              : 'bg-white/5 hover:bg-white/10 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <FiExternalLink size={16} />
                          <span>{t('watchMovie') || 'Смотреть фильм'}</span>
                        </motion.button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {renderPagination()}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MoviesList;

