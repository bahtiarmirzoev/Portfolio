import { useState, useEffect, useMemo } from 'react';
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
  const [viewMode, setViewMode] = useState('grid');
  const [selectedActorId, setSelectedActorId] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const loadActors = async () => {
      try {
        setLoading(true);
        const data = await actorsService.getAll(sortBy, sortOrder);
        
        if (!data || !Array.isArray(data)) {
          console.error('Invalid data format:', data);
          setActors([]);
          return;
        }

        const uniqueActors = Array.from(
          new Map(data.map((actor) => [actor.id, actor])).values()
        );

        setActors(uniqueActors);
        if (uniqueActors.length > 0 && !selectedActorId) {
          setSelectedActorId(uniqueActors[0].id);
        }
      } catch (error) {
        console.error('Error loading actors:', error);
        console.error('Error details:', error.response?.data || error.message);
        setError(error.message || 'Ошибка при загрузке актеров');
        toast.error(t?.('errorLoadingActors') || 'Ошибка при загрузке актеров');
        setActors([]);
      } finally {
        setLoading(false);
      }
    };

    loadActors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  const filteredActors = useMemo(() => {
    if (!searchQuery.trim()) {
      return actors;
    }

    const query = searchQuery.toLowerCase();
    return actors.filter((actor) => actor.name.toLowerCase().includes(query));
  }, [actors, searchQuery]);

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
          toast.error(t('errorLoadingActorDetails') || 'Ошибка при загрузке информации об актере');
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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setShowSortMenu(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;

    try {
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(dateString));
    } catch (error) {
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

  const renderWorks = (items, type) => {
    if (!items || items.length === 0) {
      return (
        <p className="text-sm text-white/40">
          {type === 'movies' ? t('noActorMovies') : t('noActorSeries')}
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
            +{items.length - 6} {t('more') || 'еще'}
          </div>
        )}
      </div>
    );
  };

  const sortOptions = [
    { value: 'name', label: t('sortTitle') || 'По имени' },
    { value: 'dateofbirth', label: t('sortByDate') || 'По дате рождения' },
  ];

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
        <div className="mb-10 space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl font-semibold text-white tracking-tight"
              >
                {t?.('actors') || 'Актеры'}
              </motion.h1>
              <p className="text-white/50">
                {t?.('actorsCatalog') || 'Каталог актеров'} • {filteredActors?.length || 0} {t?.('total')?.toLowerCase() || 'всего'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 md:flex-initial md:w-80">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-11 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0"
                  placeholder={t?.('searchActors') || 'Поиск актеров...'}
                />
              </div>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
                >
                  {sortOrder === 'asc' ? (
                    <FiArrowUp />
                  ) : (
                    <FiArrowDown />
                  )}
                  <span className="hidden sm:inline">
                    {sortOptions.find((opt) => opt.value === sortBy)?.label}
                  </span>
                  <FiChevronDown
                    className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`}
                  />
                </motion.button>

                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-black/80 p-2 backdrop-blur-2xl"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSort(option.value)}
                          className={`w-full rounded-xl px-4 py-2 text-left text-sm transition-colors ${
                            sortBy === option.value
                              ? 'bg-white text-black'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {sortBy === option.value && (
                              <span className="text-xs">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/40 p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`rounded-xl p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <FiGrid size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`rounded-xl p-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <FiList size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-500/50 bg-red-500/10 p-16 text-center backdrop-blur-2xl">
            <h2 className="text-2xl font-semibold text-red-400 mb-2">Ошибка</h2>
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
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
        ) : !filteredActors || filteredActors.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-2xl">
            <FiUser className="mx-auto mb-4 text-6xl text-white/20" />
            <h2 className="text-2xl font-semibold text-white mb-2">{t?.('notFound') || 'Не найдено'}</h2>
            <p className="text-white/60">{t?.('tryDifferentSearch') || 'Попробуйте изменить параметры поиска'}</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
                <div className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/40">
                  {t('actors')}
                </div>
                <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-2">
                  {filteredActors.map((actor) => {
                    const isActive = actor.id === selectedActorId;
                    return (
                      <motion.button
                        key={actor.id}
                        whileHover={{ x: 6 }}
                        onClick={() => handleSelectActor(actor.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          isActive
                            ? 'border-white bg-white text-black shadow-xl'
                            : 'border-white/10 bg-black/40 text-white/80 hover:border-white/30 hover:bg-black/60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border text-sm font-semibold ${
                              isActive
                                ? 'border-black bg-black/10 text-black'
                                : 'border-white/20 bg-white/10 text-white'
                            }`}
                          >
                            {getInitials(actor.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`truncate text-sm font-semibold ${
                                isActive ? 'text-black' : 'text-white'
                              }`}
                            >
                              {actor.name}
                            </div>
                            {actor.dateOfBirth && (
                              <div
                                className={`mt-1 text-xs ${
                                  isActive ? 'text-black/60' : 'text-white/40'
                                }`}
                              >
                                {new Date(actor.dateOfBirth).getFullYear()}
                              </div>
                            )}
                          </div>
                          <FiChevronRight
                            className={`flex-shrink-0 ${isActive ? 'text-black/50' : 'text-white/30'}`}
                          />
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
                    className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-2xl"
                  >
                    <div className="space-y-8">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-4">
                          <h1 className="text-4xl font-semibold text-white tracking-tight lg:text-5xl">
                            {selectedActor.name}
                          </h1>
                          {selectedActor.dateOfBirth && (
                            <div className="flex items-center gap-2 text-sm text-white/50">
                              <FiCalendar />
                              <span>{formatDate(selectedActor.dateOfBirth)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-center">
                            <p className="text-xs uppercase tracking-[0.3em] text-white/30">
                              {t('movies')}
                            </p>
                            <p className="mt-1 text-lg font-semibold text-white">
                              {selectedActor.movies?.length ?? 0}
                            </p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-center">
                            <p className="text-xs uppercase tracking-[0.3em] text-white/30">
                              {t('series')}
                            </p>
                            <p className="mt-1 text-lg font-semibold text-white">
                              {selectedActor.series?.length ?? 0}
                            </p>
                          </div>
                          <Link
                            to={`/actors/${selectedActor.id}`}
                            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-center text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
                          >
                            <p className="text-xs uppercase tracking-[0.3em] text-white/30">
                              {t('profile')}
                            </p>
                            <p className="mt-1 font-medium">{t('goTo')}</p>
                          </Link>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/40">
                          <FiBookOpen className="text-base" />
                          Биография
                        </div>
                        <p className="text-white/70 leading-relaxed">
                          {selectedActor.biography || t('actorNotFound')}
                        </p>
                      </div>
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
                    {t('selectActor') || 'Выберите актера, чтобы увидеть подробности.'}
                  </motion.section>
                )}
              </AnimatePresence>

              {selectedActor && !detailsLoading && (
                <div className="space-y-8">
                  <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
                    <div className="mb-6 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/40">
                      <FiFilm className="text-base" />
                      {t('actorMovies')}
                    </div>
                    {renderWorks(selectedActor.movies, 'movies')}
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
                    <div className="mb-6 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/40">
                      <FiTv className="text-base" />
                      {t('actorSeries')}
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
