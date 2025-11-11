import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { actorsService } from '../../services/actorsService';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  FiUser,
  FiSearch,
  FiChevronDown,
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
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ActorsList = () => {
  const { t } = useLanguage();
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('list');
  const [selectedActorId, setSelectedActorId] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const pageSize = 200;
  const [page, setPage] = useState(1);
  const [totalActors, setTotalActors] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const isSearching = Boolean(debouncedSearch);

  const loadActors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let items = [];
      let total = 0;

      if (isSearching) {
        const result = await actorsService.search({
          name: debouncedSearch,
          page,
          pageSize,
        });
        items = result.items || [];
        total = result.total ?? items.length;
      } else {
        const result = await actorsService.getAll({
          page,
          pageSize,
          sortBy,
          sortOrder,
        });
        items = result.items || [];
        total = result.total ?? items.length;
      }

      const uniqueActors = Array.from(new Map(items.map((actor) => [actor.id, actor])).values());

      setActors(uniqueActors);
      setTotalActors(total ?? uniqueActors.length);

      if (uniqueActors.length === 0) {
        setSelectedActorId(null);
        setSelectedActor(null);
        return;
      }

      setSelectedActorId((prev) => {
        if (prev && uniqueActors.some((actor) => actor.id === prev)) {
          return prev;
        }
        return uniqueActors[0].id;
      });
    } catch (error) {
      console.error('Error loading actors:', error);
      console.error('Error details:', error.response?.data || error.message);
      const message = error.response?.data?.message || error.message || 'Ошибка при загрузке актеров';
      setError(message);
      toast.error(t?.('errorLoadingActors') || message);
      setActors([]);
      setSelectedActorId(null);
      setSelectedActor(null);
      setTotalActors(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, isSearching, page, pageSize, sortBy, sortOrder, t]);

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

  const heroStats = useMemo(() => {
    const stats = [
      {
        label: t?.('total') || 'Всего',
        value: totalActors ?? 0,
        caption: t?.('actors') || 'Actors',
      },
    ];

    if (selectedActor) {
      stats.push(
        {
          label: t?.('actorMovies') || 'Фильмы',
          value: selectedActor.movies?.length ?? 0,
          caption: selectedActor.name,
        },
        {
          label: t?.('actorSeries') || 'Сериалы',
          value: selectedActor.series?.length ?? 0,
          caption: selectedActor.name,
        }
      );
    }

    return stats;
  }, [selectedActor, t, totalActors]);

  const filteredActors = useMemo(() => {
    if (isSearching) {
      return actors;
    }

    if (!searchQuery.trim()) {
      return actors;
    }

    const query = searchQuery.toLowerCase();
    return actors.filter((actor) => actor.name.toLowerCase().includes(query));
  }, [actors, searchQuery, isSearching]);

  const visibleActorsCount = filteredActors.length;
  const displayedCount = isSearching ? totalActors || visibleActorsCount : visibleActorsCount;

  useEffect(() => {
    if (filteredActors.length === 0) {
      setSelectedActorId(null);
      setSelectedActor(null);
      return;
    }

    const exists = filteredActors.some((actor) => actor.id === selectedActorId);
    if (!exists && filteredActors.length > 0) {
      setSelectedActorId(filteredActors[0].id);
    }
  }, [filteredActors]);

  useEffect(() => {
    if (!selectedActorId) {
      setSelectedActor(null);
      return;
    }

    let isCancelled = false;

    const fetchDetails = async () => {
      try {
        setDetailsLoading(true);
        const data = await actorsService.getById(selectedActorId);
        if (!isCancelled) {
          setSelectedActor(data);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error loading actor details:', error);
          toast.error(t?.('errorLoadingActorDetails') || 'Ошибка при загрузке информации об актере');
        }
      } finally {
        if (!isCancelled) {
          setDetailsLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActorId]);

  const handleSelectActor = (id) => {
    setSelectedActorId(id);
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
      console.error("Error parsing date:", dateString, e);
      return dateString; // Fallback to original string if parsing fails
    }
  };

  const detailHighlights = useMemo(() => {
    if (!selectedActor) return [];

    const highlights = [];

    if (selectedActor.dateOfBirth) {
      highlights.push({
        icon: FiCalendar,
        label: t?.('dateOfBirth') || 'Дата рождения',
        value: formatDate(selectedActor.dateOfBirth),
      });
    }

    highlights.push({
      icon: FiFilm,
      label: t?.('actorMovies') || 'Фильмы',
      value: selectedActor.movies?.length ?? 0,
    });

    highlights.push({
      icon: FiTv,
      label: t?.('actorSeries') || 'Сериалы',
      value: selectedActor.series?.length ?? 0,
    });

    return highlights;
  }, [selectedActor, t]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
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
      <div className="grid gap-3 sm:grid-cols-2">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            to={`/${type === 'movies' ? 'movies' : 'series'}/${item.id}`}
            className="group rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white/70 transition-all hover:border-white/30 hover:text-white hover:bg-black/60"
          >
            <div className="font-semibold leading-tight">{item.title}</div>
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
        {items.length > 6 && (
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/50">
            +{items.length - 6} {t?.('more') || 'еще'}
          </div>
        )}
      </div>
    );
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-950 to-black p-4 md:p-10"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-14 top-16 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-16 right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl">
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
                  {t?.('selectActor') || 'Select an actor'} • {totalActors} {t?.('actors') || 'actors'}
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
                      <div className="text-xs text-white/30 mt-1 line-clamp-1 max-w-[120px]">{stat.caption}</div>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Controls Section */}
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

            {(debouncedSearch || selectedActor) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10"
              >
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70">
                    <FiSearch className="opacity-70" size={12} />
                    <span>Search: {debouncedSearch}</span>
                  </span>
                )}
                {selectedActor && (
                  <span className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70">
                    <FiUser className="opacity-70" size={12} />
                    <span>{selectedActor.name}</span>
                  </span>
                )}
              </motion.div>
            )}
          </div>
        </motion.section>

        {error ? (
          <div className="rounded-3xl border border-red-500/50 bg-red-500/10 p-16 text-center backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold text-red-400 mb-2">Ошибка</h2>
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => {
                setError(null);
                loadActors();
              }}
              className="mt-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90"
            >
              Перезагрузить
            </button>
          </div>
        ) : loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-2xl">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="mt-4 text-white/60">{t?.('loading') || 'Загрузка...'}</p>
          </div>
        ) : !actors || actors.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-2xl">
            <FiUser className="mx-auto mb-4 text-6xl text-white/20" />
            <h2 className="text-2xl font-semibold text-white mb-2">{t?.('notFound') || 'Актеры не найдены'}</h2>
            <p className="text-white/60">{t?.('tryDifferentSearch') || 'Попробуйте изменить параметры поиска'}</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/40">
                  {t?.('actors') || 'Актеры'}
                </div>
                <div
                  className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'} max-h-[70vh] overflow-y-auto pr-2`}
                >
                  {filteredActors.map((actor, index) => {
                    const isActive = actor.id === selectedActorId;
                    const birthYearValue = actor.dateOfBirth
                      ? new Date(actor.dateOfBirth).getFullYear()
                      : null;
                    const safeBirthYear =
                      birthYearValue !== null && !Number.isNaN(birthYearValue) ? birthYearValue : null;

                    return (
                      <motion.button
                        key={actor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.4 }}
                        whileHover={{ scale: 1.02, rotate: -0.25 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectActor(actor.id)}
                        className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                          isActive
                            ? 'border-white/70 bg-white text-black shadow-2xl shadow-white/20'
                            : 'border-white/10 bg-black/40 text-white/80 hover:border-white/30 hover:bg-black/60'
                        } ${viewMode === 'grid' ? 'p-5 flex flex-col gap-4' : 'p-4 flex items-center gap-4'}`}
                      >
                        <motion.span
                          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
                          animate={isActive ? { opacity: [0.25, 0.45, 0.25] } : undefined}
                          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                          style={{
                            background:
                              'radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)',
                          }}
                        />
                        <div
                          className={`relative z-10 flex ${
                            viewMode === 'grid' ? 'flex-col items-start gap-4' : 'items-center gap-4'
                          }`}
                        >
                          <motion.div
                            layoutId={`actor-avatar-${actor.id}`}
                            className={`flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-semibold shadow-inner ${
                              isActive
                                ? 'border-black bg-black/10 text-black'
                                : 'border-white/20 bg-white/10 text-white'
                            }`}
                            whileHover={{ rotate: viewMode === 'grid' ? -2 : 0 }}
                          >
                            {getInitials(actor.name)}
                          </motion.div>
                          <div
                            className={`${
                              viewMode === 'grid'
                                ? 'w-full space-y-2'
                                : 'min-w-0 flex-1 space-y-1'
                            }`}
                          >
                            <div
                              className={`font-semibold tracking-tight ${
                                isActive ? 'text-black' : 'text-white'
                              } ${viewMode === 'grid' ? 'text-lg' : 'truncate text-sm'}`}
                            >
                              {actor.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
                              {safeBirthYear !== null && (
                                <span className="inline-flex items-center gap-1">
                                  <FiCalendar className="opacity-60" />
                                  {safeBirthYear}
                                </span>
                              )}
                              {actor.biography && (
                                <span className="inline-flex items-center gap-1">
                                  <FiBookOpen className="opacity-50" />
                                  <span
                                    className={`${isActive ? 'text-black/60' : 'text-white/45'} text-xs leading-relaxed`}
                                    style={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: viewMode === 'grid' ? 2 : 1,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {actor.biography}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                          {viewMode === 'list' && (
                            <FiChevronRight
                              className={`ml-auto transition-transform ${
                                isActive
                                  ? 'text-black/50 translate-x-1'
                                  : 'text-white/30 group-hover:translate-x-1'
                              }`}
                            />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <main className="space-y-8">
              <AnimatePresence mode="wait">
                {detailsLoading ? (
                  <motion.section
                    key="loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-2xl"
                  >
                    <div className="space-y-6 animate-pulse">
                      <div className="h-10 w-1/3 rounded bg-white/10" />
                      <div className="h-4 w-1/2 rounded bg-white/10" />
                      <div className="h-32 rounded-2xl bg-white/10" />
                    </div>
                  </motion.section>
                ) : selectedActor ? (
                  <motion.section
                    key={selectedActor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-8 md:p-12 backdrop-blur-3xl shadow-[0_0_90px_rgba(255,255,255,0.08)]"
                  >
                    <motion.div
                      className="pointer-events-none absolute -left-28 -top-32 h-72 w-72 rounded-full bg-gradient-to-br from-white/12 via-transparent to-transparent blur-[140px]"
                      animate={{ rotate: [0, 15, 0] }}
                      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      className="pointer-events-none absolute right-[-10%] bottom-[-20%] h-80 w-80 rounded-full bg-gradient-to-tl from-white/10 via-transparent to-transparent blur-[160px]"
                      animate={{ rotate: [0, -20, 0] }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                    />

                    <div className="relative z-10 space-y-10">
                      <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                          <motion.div
                            layoutId={`actor-avatar-${selectedActor.id}`}
                            className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-br from-white/15 via-transparent to-white/5 text-3xl font-semibold text-white shadow-[0_0_30px_rgba(255,255,255,0.12)]"
                            whileHover={{ rotate: 2 }}
                          >
                            {getInitials(selectedActor.name)}
                          </motion.div>
                          <div className="space-y-3 text-white">
                            <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
                              {selectedActor.name}
                            </h1>
                            {selectedActor.dateOfBirth && (
                              <div className="flex items-center gap-2 text-sm text-white/60">
                                <FiCalendar className="opacity-70" />
                                <span>{formatDate(selectedActor.dateOfBirth)}</span>
                              </div>
                            )}
                            {selectedActor.biography && (
                              <p
                                className="max-w-xl text-sm text-white/50"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {selectedActor.biography}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3">
                              <Link
                                to={`/actors/${selectedActor.id}`}
                                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition-colors hover:border-white/40 hover:text-white"
                              >
                                <FiChevronRight />
                                {t?.('goTo') || 'Перейти'}
                              </Link>
                            </div>
                          </div>
                        </div>

                        <div className="grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {detailHighlights.map(({ icon: Icon, label, value }) => {
                            const isNumeric = typeof value === 'number';
                            return (
                              <motion.div
                                key={label}
                                whileHover={{ translateY: -6, scale: 1.02 }}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 px-4 py-5"
                              >
                                <Icon className="text-white/60" />
                                <div
                                  className={`mt-2 font-semibold text-white ${
                                    isNumeric ? 'text-2xl' : 'text-lg'
                                  }`}
                                >
                                  {value ?? '—'}
                                </div>
                                <p className="mt-1 text-xs text-white/40 truncate">{label}</p>
                                <motion.span
                                  className="pointer-events-none absolute -right-6 -top-10 h-16 w-16 rounded-full bg-white/10"
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 px-6 py-6"
                      >
                        <motion.span
                          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0"
                          animate={{ opacity: [0.2, 0.35, 0.2] }}
                          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <div className="relative z-10 flex items-start gap-4">
                          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white/80">
                            <FiBookOpen className="text-lg" />
                          </div>
                          <div className="space-y-3 text-white">
                            <h2 className="text-sm uppercase tracking-[0.3em] text-white/50">
                              {t?.('biography') || 'Биография'}
                            </h2>
                            <p className="text-white/75 leading-relaxed">
                              {selectedActor.biography || t?.('actorNotFound') || 'Информация не найдена'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.section>
                ) : (
                  <motion.section
                    key="placeholder"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/50 backdrop-blur-2xl"
                  >
                    {t?.('selectActor') || 'Выберите актера, чтобы увидеть подробности.'}
                  </motion.section>
                )}
              </AnimatePresence>

              {selectedActor && !detailsLoading && (
                <div className="space-y-8">
                  <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
                    <div className="mb-6 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/40">
                      <FiFilm className="text-base" />
                      {t?.('actorMovies') || 'Фильмы'}
                    </div>
                    {renderWorks(selectedActor.movies, 'movies')}
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
                    <div className="mb-6 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/40">
                      <FiTv className="text-base" />
                      {t?.('actorSeries') || 'Сериалы'}
                    </div>
                    {renderWorks(selectedActor.series, 'series')}
                  </section>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActorsList;
