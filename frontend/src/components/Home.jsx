import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useLanguageStore } from '../stores/languageStore';
import { FiFilm, FiTv, FiHeart, FiTrendingUp, FiStar, FiArrowRight, FiZap, FiMessageSquare, FiPlay } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { moviesService } from '../services/moviesService';
import { seriesService } from '../services/seriesService';

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const { t } = useLanguageStore();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    try {
      const [moviesResponse, seriesResponse] = await Promise.all([
        moviesService.getAll({ take: 6 }),
        seriesService.getOngoing({ take: 6 }),
      ]);
      // Проверяем структуру ответа
      setFeaturedMovies(moviesResponse?.items || moviesResponse || []);
      setTrendingSeries(seriesResponse?.items || seriesResponse || []);
    } catch (error) {
      console.error('Error loading featured content:', error);
      // Устанавливаем пустые массивы при ошибке
      setFeaturedMovies([]);
      setTrendingSeries([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/3 rounded-full blur-3xl"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.8, type: "spring" }}
              className="inline-block mb-6"
            >
              <div className="glass rounded-2xl px-6 py-3 border border-white/10">
                <p className="text-white/60 text-sm uppercase tracking-widest">
                  {t('welcome')}
                </p>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
            >
              {t('heroTitle')}
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="block mt-2 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent"
              >
                {t('heroSubtitle')}
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-white/70 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              {t('heroDescription')} 
              {!isAuthenticated && ` ${t('heroDescriptionAuth')}`}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Link to="/movies" className="relative btn-primary text-lg px-10 py-4 flex items-center gap-3 shadow-2xl hover:shadow-white/20 transition-all">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <FiFilm className="text-xl" />
                  </motion.div>
                  {t('watchMovies')}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FiArrowRight />
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Link to="/series" className="relative btn-secondary text-lg px-10 py-4 flex items-center gap-3 border-2 border-white/20 hover:border-white/40 transition-all">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <FiTv className="text-xl" />
                  </motion.div>
                  {t('watchSeries')}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                  >
                    <FiArrowRight />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20">

        {/* Featured Movies */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.section
              key="loading-movies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </motion.section>
          ) : featuredMovies.length > 0 && (
            <motion.section
              key="movies"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mb-20"
            >
              <div className="flex items-center justify-between mb-10">
                <motion.div 
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.div
                    className="glass rounded-xl p-3 border border-white/10"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <FiTrendingUp className="text-white text-2xl" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">{t('popularMovies')}</h2>
                    <p className="text-white/40 text-sm mt-1">{featuredMovies.length} {t('movies')}</p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/movies"
                    className="glass rounded-xl px-6 py-3 border border-white/10 text-white/70 hover:text-white flex items-center gap-2 transition-all hover:border-white/30"
                  >
                    {t('allMovies')} <FiArrowRight />
                  </Link>
                </motion.div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                {featuredMovies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.5, type: "spring" }}
                    whileHover={{ y: -12, scale: 1.03 }}
                    className="group cursor-pointer"
                  >
                    <Link to={`/movies/${movie.id}`}>
                      {movie.posterUrl ? (
                        <div className="relative overflow-hidden rounded-xl mb-3 aspect-[2/3] border border-white/10 group-hover:border-white/30 transition-all">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white font-bold text-sm line-clamp-2 mb-2">
                                {movie.title}
                              </h3>
                              {movie.averageRating && (
                                <div className="flex items-center gap-1.5">
                                  <FiStar className="text-white fill-white" size={14} />
                                  <span className="text-white text-xs font-semibold">{movie.averageRating.toFixed(1)}</span>
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                className="mt-3 flex items-center gap-2 text-white/80 text-xs"
                              >
                                <FiPlay className="text-white" size={16} />
                                <span>Смотреть</span>
                              </motion.div>
                            </div>
                          </div>
                          {movie.year && (
                            <div className="absolute top-2 left-2 glass rounded-lg px-2 py-1 border border-white/10">
                              <span className="text-white text-xs font-medium">{movie.year}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[2/3] glass rounded-xl flex items-center justify-center mb-3 border border-white/10">
                          <FiFilm className="text-white/20 text-4xl" />
                        </div>
                      )}
                      <h3 className="text-white/80 text-sm font-medium line-clamp-2 group-hover:text-white transition-colors px-1">
                        {movie.title}
                      </h3>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Trending Series */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.section
              key="loading-series"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </motion.section>
          ) : trendingSeries.length > 0 && (
            <motion.section
              key="series"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mb-20"
            >
              <div className="flex items-center justify-between mb-10">
                <motion.div 
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  <motion.div
                    className="glass rounded-xl p-3 border border-white/10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <FiTv className="text-white text-2xl" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">{t('ongoingSeries')}</h2>
                    <p className="text-white/40 text-sm mt-1">{trendingSeries.length} {t('series')}</p>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/series?ongoing=true"
                    className="glass rounded-xl px-6 py-3 border border-white/10 text-white/70 hover:text-white flex items-center gap-2 transition-all hover:border-white/30"
                  >
                    {t('allSeries')} <FiArrowRight />
                  </Link>
                </motion.div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                {trendingSeries.map((series, index) => (
                  <motion.div
                    key={series.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.3 + index * 0.1, duration: 0.5, type: "spring" }}
                    whileHover={{ y: -12, scale: 1.03 }}
                    className="group cursor-pointer"
                  >
                    <Link to={`/series/${series.id}`}>
                      {series.posterUrl ? (
                        <div className="relative overflow-hidden rounded-xl mb-3 aspect-[2/3] border border-white/10 group-hover:border-white/30 transition-all">
                          <img
                            src={series.posterUrl}
                            alt={series.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {series.isOngoing && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 glass rounded-lg px-2 py-1 border border-white/20"
                            >
                              <span className="text-white text-xs font-semibold flex items-center gap-1">
                                <motion.span
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-1.5 h-1.5 bg-white rounded-full"
                                />
                                Идёт
                              </span>
                            </motion.div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white font-bold text-sm line-clamp-2 mb-2">
                                {series.title}
                              </h3>
                              {series.averageRating && (
                                <div className="flex items-center gap-1.5">
                                  <FiStar className="text-white fill-white" size={14} />
                                  <span className="text-white text-xs font-semibold">{series.averageRating.toFixed(1)}</span>
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                className="mt-3 flex items-center gap-2 text-white/80 text-xs"
                              >
                                <FiPlay className="text-white" size={16} />
                                <span>Смотреть</span>
                              </motion.div>
                            </div>
                          </div>
                          {series.yearOfRelease && (
                            <div className="absolute top-2 left-2 glass rounded-lg px-2 py-1 border border-white/10">
                              <span className="text-white text-xs font-medium">{series.yearOfRelease}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[2/3] glass rounded-xl flex items-center justify-center mb-3 border border-white/10">
                          <FiTv className="text-white/20 text-4xl" />
                        </div>
                      )}
                      <h3 className="text-white/80 text-sm font-medium line-clamp-2 group-hover:text-white transition-colors px-1">
                        {series.title}
                      </h3>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Quick Navigation */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-10">
            <motion.div
              className="glass rounded-xl p-3 border border-white/10"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
              <FiZap className="text-white text-3xl" />
            </motion.div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">{t('quickNavigation')}</h2>
              <p className="text-white/40 text-sm mt-1">Быстрый доступ к каталогам</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -8 }}
              className="glass rounded-2xl p-8 cursor-pointer group relative overflow-hidden border border-white/10 hover:border-white/30 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Link to="/movies" className="block relative z-10">
                <div className="flex items-center gap-5 mb-6">
                  <motion.div
                    className="w-20 h-20 glass rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/30 group-hover:bg-white transition-all duration-300"
                    whileHover={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <FiFilm className="text-4xl text-white group-hover:text-black transition-colors" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{t('movies')}</h3>
                    <p className="text-white/60 text-sm">{t('catalog')}</p>
                  </div>
                </div>
                <p className="text-white/70 leading-relaxed mb-6">
                  {t('moviesDesc')}
                </p>
                <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                  <span className="font-medium">{t('goTo')}</span>
                  <motion.div
                    className="group-hover:translate-x-1 transition-transform"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FiArrowRight size={18} />
                  </motion.div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.7, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -8 }}
              className="glass rounded-2xl p-8 cursor-pointer group relative overflow-hidden border border-white/10 hover:border-white/30 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Link to="/series" className="block relative z-10">
                <div className="flex items-center gap-5 mb-6">
                  <motion.div
                    className="w-20 h-20 glass rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/30 group-hover:bg-white transition-all duration-300"
                    whileHover={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <FiTv className="text-4xl text-white group-hover:text-black transition-colors" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{t('series')}</h3>
                    <p className="text-white/60 text-sm">{t('catalog')}</p>
                  </div>
                </div>
                <p className="text-white/70 leading-relaxed mb-6">
                  {t('seriesDesc')}
                </p>
                <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                  <span className="font-medium">{t('goTo')}</span>
                  <motion.div
                    className="group-hover:translate-x-1 transition-transform"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                  >
                    <FiArrowRight size={18} />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Features for authenticated users */}
        {isAuthenticated && (
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
            className="mt-12"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Ваш профиль</h2>
              <p className="text-white/40 text-sm">Быстрый доступ к вашим данным</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: t('favorites'), desc: 'Сохраненные фильмы и сериалы', link: '/profile', tab: 'favorites', icon: FiHeart },
                { title: t('myComments'), desc: 'Ваши комментарии', link: '/profile', tab: 'comments', icon: FiMessageSquare },
                { title: t('myRatings'), desc: 'Ваши оценки', link: '/profile', tab: 'ratings', icon: FiStar },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.9 + index * 0.15, duration: 0.7, ease: "easeOut" }}
                    whileHover={{ scale: 1.03, y: -8 }}
                    className="glass rounded-2xl p-6 cursor-pointer group relative overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Link to={feature.link} state={{ activeTab: feature.tab }} className="block relative z-10">
                      <motion.div
                        className="mb-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                      >
                        <div className="w-14 h-14 glass rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/30">
                          <Icon className="text-2xl text-white group-hover:scale-110 transition-transform" />
                        </div>
                      </motion.div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors">{feature.title}</h3>
                      <p className="text-white/60 text-sm mb-4">{feature.desc}</p>
                      <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                        <span className="text-sm font-medium">{t('goTo')}</span>
                        <motion.div
                          className="group-hover:translate-x-1 transition-transform"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.3 }}
                        >
                          <FiArrowRight size={16} />
                        </motion.div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default Home;

