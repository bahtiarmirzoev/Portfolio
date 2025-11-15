import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { actorsService } from '../../services/actorsService';
import { useLanguageStore } from '../../stores/languageStore';
import {
  FiUser,
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiArrowUp,
  FiArrowDown,
  FiCalendar,
  FiFilm,
  FiTv,
  FiBookOpen,
  FiStar,
  FiCheck,
  FiX,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ActorsList = () => {
  const { t } = useLanguageStore();
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedActor, setSelectedActor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [totalActors, setTotalActors] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const pageSize = 24;
  const sortMenuRef = useRef(null);

  const totalPages = Math.ceil(totalActors / pageSize);

  const loadActors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await actorsService.getAll({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });

      const items = result.items || [];
      
      const uniqueActors = items.reduce((acc, actor) => {
        const existing = acc.find(a => 
          a.id === actor.id || 
          a.name?.toLowerCase().trim() === actor.name?.toLowerCase().trim()
        );
        if (!existing) {
          acc.push(actor);
        }
        return acc;
      }, []);

      const total = result.total ?? result.totalCount ?? uniqueActors.length;

      setActors(uniqueActors);
      setTotalActors(total);
    } catch (error) {
      console.error('Error loading actors:', error);
      const message = error.response?.data?.message || error.message || 'Ошибка при загрузке актеров';
      setError(message);
      toast.error(t?.('errorLoadingActors') || message);
      setActors([]);
      setTotalActors(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, pageSize, sortBy, sortOrder, t]);

  useEffect(() => {
    loadActors();
  }, [loadActors]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActorClick = async (actorId) => {
    try {
      setDetailsLoading(true);
      setShowDetailsModal(true);
      const data = await actorsService.getById(actorId);
      setSelectedActor(data);
    } catch (error) {
      console.error('Error loading actor details:', error);
      toast.error(t?.('errorLoadingActorDetails') || 'Ошибка при загрузке информации об актере');
      setShowDetailsModal(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSortSelect = (option) => {
    setSortBy(option.sortBy);
    setSortOrder(option.sortOrder);
    setShowSortMenu(false);
    setPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getBirthYear = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).getFullYear();
    } catch (e) {
      return null;
    }
  };

  const sortOptions = [
    { id: 'name-asc', sortBy: 'name', sortOrder: 'asc', label: t?.('sortNameAsc') || 'Имя (А–Я)' },
    { id: 'name-desc', sortBy: 'name', sortOrder: 'desc', label: t?.('sortNameDesc') || 'Имя (Я–А)' },
    { id: 'date-desc', sortBy: 'dateofbirth', sortOrder: 'desc', label: t?.('sortDateDesc') || 'Дата рождения (новые)' },
    { id: 'date-asc', sortBy: 'dateofbirth', sortOrder: 'asc', label: t?.('sortDateAsc') || 'Дата рождения (старые)' },
  ];

  const activeSort =
    sortOptions.find((option) => option.sortBy === sortBy && option.sortOrder === sortOrder) || sortOptions[0];
  const SortDirectionIcon = activeSort.sortOrder === 'asc' ? FiArrowUp : FiArrowDown;

  const heroStats = [
    {
      label: t?.('total') || 'Всего',
      value: totalActors,
    },
    {
      label: t?.('page') || 'Страница',
      value: `${page} / ${totalPages || 1}`,
    },
    {
      label: t?.('sortBy') || 'Сортировка',
      value: activeSort.label,
    },
  ];

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
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="px-3 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronsLeft size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-3 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronLeft size={18} />
        </motion.button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => setPage(1)}
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
            onClick={() => setPage(pageNum)}
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
              onClick={() => setPage(totalPages)}
              className="px-4 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronRight size={18} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          className="px-3 py-2 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronsRight size={18} />
        </motion.button>
      </div>
    );
  };

  const renderWorks = (items, type) => {
    if (!items || items.length === 0) {
      return (
        <p className="text-sm text-white/40">
          {type === 'movies' ? t?.('noActorMovies') || 'Нет фильмов' : t?.('noActorSeries') || 'Нет сериалов'}
        </p>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/${type === 'movies' ? 'movies' : 'series'}/${item.id}`}
            onClick={() => setShowDetailsModal(false)}
            className="group rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white/70 transition-all hover:border-white/30 hover:text-white hover:bg-black/60"
          >
            <div className="font-semibold leading-tight text-sm">{item.title}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
              <span>
                {type === 'movies'
                  ? item.year ?? item.yearOfRelease ?? ''
                  : `${item.yearOfRelease}${item.yearOfEnd ? ` — ${item.yearOfEnd}` : item.isOngoing ? ' — ...' : ''}`}
              </span>
              {item.averageRating && (
                <span className="flex items-center gap-1">
                  <FiStar className="text-yellow-400 fill-yellow-400" size={12} />
                  {item.averageRating.toFixed(1)}
                </span>
              )}
            </div>
          </Link>
        ))}
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
        {}
        <motion.section
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-12"
        >
          {}
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
                    {t?.('catalog') || 'CATALOG'}
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
                  {t?.('actors') || 'ACTORS'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-white/50 text-lg font-light"
                >
                  {totalActors} {t?.('actors') || 'актеров'}
                </motion.p>
              </div>

              {}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-wrap items-center gap-6 md:gap-8"
              >
                {heroStats.map((stat, idx) => (
                  <div key={idx} className="text-center md:text-right">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-white/40">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1 w-full lg:max-w-2xl">
                <div className="relative">
                  <FiSearch className="absolute left-0 top-1/2 -translate-y-1/2 ml-4 text-white/40" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 border-b-2 border-white/20 pb-3 pl-12 pr-4 text-white placeholder-white/30 focus:border-white focus:outline-none focus:ring-0 text-lg"
                    placeholder={t?.('searchPlaceholder') || 'Search actors...'}
                  />
                </div>
              </div>

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

                <div className="relative" ref={sortMenuRef}>
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
                          const isActive = option.sortBy === sortBy && option.sortOrder === sortOrder;
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleSortSelect(option)}
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
              </div>
            </div>
          </div>
        </motion.section>

        {}
        {error ? (
          <div className="rounded-3xl border border-red-500/50 bg-red-500/10 p-16 text-center">
            <h2 className="text-2xl font-semibold text-red-400 mb-2">{t?.('error') || 'Ошибка'}</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => loadActors()}
              className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
            >
              {t?.('reload') || 'Перезагрузить'}
            </motion.button>
          </div>
        ) : loading && actors.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-5 animate-pulse">
                <div className="aspect-square rounded-2xl bg-white/10 mb-4"></div>
                <div className="h-6 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : actors.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center">
            <FiUser className="mx-auto mb-4 text-6xl text-white/20" />
            <h2 className="text-2xl font-semibold text-white mb-2">{t?.('notFound') || 'Актеры не найдены'}</h2>
            <p className="text-white/60">{t?.('tryDifferentSearch') || 'Попробуйте изменить параметры поиска'}</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
                {actors.map((actor, index) => {
                  const birthYear = getBirthYear(actor.dateOfBirth);
                  return (
                    <motion.div
                      key={actor.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.5, ease: 'easeOut' }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleActorClick(actor.id);
                      }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] cursor-pointer backdrop-blur-2xl shadow-[0_0_60px_rgba(255,255,255,0.05)] transition-all flex flex-col h-full"
                    >
                      <motion.span
                        className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-white/10"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      />
                      <div className="relative z-10 flex flex-col flex-1 p-5">
                        {}
                        <div className="flex justify-center mb-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/15 to-white/5 text-2xl font-bold text-white shadow-lg backdrop-blur-sm"
                          >
                            {getInitials(actor.name)}
                          </motion.div>
                        </div>

                        {}
                        <div className="flex flex-col flex-1 space-y-3 text-center">
                          {}
                          <div className="min-h-[3rem] flex items-center justify-center">
                            <h3 
                              className="text-base font-bold text-white leading-tight"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {actor.name}
                            </h3>
                          </div>

                          {}
                          <div className="min-h-[1.5rem] flex items-center justify-center">
                            {birthYear ? (
                              <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/70">
                                <FiCalendar size={12} className="opacity-70" />
                                <span>{birthYear}</span>
                              </div>
                            ) : (
                              <div className="h-full"></div>
                            )}
                          </div>

                          {}
                          <div className="min-h-[3rem] flex-1 flex items-start justify-center">
                            {actor.biography ? (
                              <p
                                className="text-xs text-white/60 leading-relaxed"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {actor.biography}
                              </p>
                            ) : (
                              <div className="h-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 mb-12">
                {actors.map((actor, index) => {
                  const birthYear = getBirthYear(actor.dateOfBirth);
                  return (
                    <motion.div
                      key={actor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.4 }}
                      whileHover={{ x: 4 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleActorClick(actor.id);
                      }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 cursor-pointer backdrop-blur-2xl transition-all hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-white/15 to-white/5 text-xl font-bold text-white"
                        >
                          {getInitials(actor.name)}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white group-hover:text-white/80 transition-colors mb-1">
                            {actor.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-white/50">
                            {birthYear && (
                              <span className="flex items-center gap-1">
                                <FiCalendar className="opacity-60" size={14} />
                                {birthYear}
                              </span>
                            )}
                            {actor.biography && (
                              <p className="text-xs text-white/40 line-clamp-1 flex-1">
                                {actor.biography}
                              </p>
                            )}
                          </div>
                        </div>
                        <FiChevronRight className="text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" size={20} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {}
            {renderPagination()}
          </>
        )}
      </div>

      {}
      <AnimatePresence>
        {showDetailsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-4xl md:w-full md:max-h-[90vh] z-50 overflow-hidden rounded-3xl border border-white/10 bg-black/95 backdrop-blur-xl"
            >
              <div className="relative h-full overflow-y-auto">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <FiX size={20} />
                </button>

                {detailsLoading ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white mb-4" />
                    <p className="text-white/60">{t?.('loading') || 'Загрузка...'}</p>
                  </div>
                ) : selectedActor ? (
                  <div className="p-8 md:p-12 space-y-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="flex h-32 w-32 items-center justify-center rounded-3xl border-2 border-white/20 bg-gradient-to-br from-white/15 to-white/5 text-5xl font-bold text-white shadow-lg"
                      >
                        {getInitials(selectedActor.name)}
                      </motion.div>
                      <div className="flex-1 space-y-4">
                        <h1 className="text-4xl font-bold text-white">{selectedActor.name}</h1>
                        {selectedActor.dateOfBirth && (
                          <div className="flex items-center gap-2 text-white/60">
                            <FiCalendar className="opacity-70" />
                            <span>{formatDate(selectedActor.dateOfBirth)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedActor.biography && (
                      <div className="space-y-3">
                        <h2 className="text-sm uppercase tracking-wider text-white/50 flex items-center gap-2">
                          <FiBookOpen />
                          {t?.('biography') || 'Биография'}
                        </h2>
                        <p className="text-white/75 leading-relaxed">{selectedActor.biography}</p>
                      </div>
                    )}

                    {selectedActor.movies && selectedActor.movies.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-sm uppercase tracking-wider text-white/50 flex items-center gap-2">
                          <FiFilm />
                          {t?.('actorMovies') || 'Фильмы'} ({selectedActor.movies.length})
                        </h2>
                        {renderWorks(selectedActor.movies, 'movies')}
                      </div>
                    )}

                    {selectedActor.series && selectedActor.series.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-sm uppercase tracking-wider text-white/50 flex items-center gap-2">
                          <FiTv />
                          {t?.('actorSeries') || 'Сериалы'} ({selectedActor.series.length})
                        </h2>
                        {renderWorks(selectedActor.series, 'series')}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ActorsList;
