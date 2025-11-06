import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FiFilm, FiTv, FiHeart, FiTrendingUp, FiStar, FiArrowRight, FiZap, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { moviesService } from '../services/moviesService';
import { seriesService } from '../services/seriesService';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              {t('heroTitle')}
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="block bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent"
              >
                {t('heroSubtitle')}
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-white/70 mb-12 leading-relaxed"
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
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/movies" className="btn-primary text-lg px-8 py-4 flex items-center gap-2 shadow-xl hover:shadow-2xl">
                  <FiFilm /> {t('watchMovies')}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FiArrowRight />
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/series" className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                  <FiTv /> {t('watchSeries')}
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">

        {/* Featured Movies */}
        {!loading && featuredMovies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <FiTrendingUp className="text-white text-2xl" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white">{t('popularMovies')}</h2>
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
              >
                <Link
                  to="/movies"
                  className="text-white/60 hover:text-white flex items-center gap-2 transition-colors"
                >
                  {t('allMovies')} <FiArrowRight />
                </Link>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <Link to={`/movies/${movie.id}`}>
                    {movie.posterUrl ? (
                      <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3]">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-semibold text-sm line-clamp-2">
                              {movie.title}
                            </h3>
                            {movie.averageRating && (
                              <div className="flex items-center gap-1 mt-2">
                                <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
                                <span className="text-white text-xs">{movie.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[2/3] bg-white/5 rounded-lg flex items-center justify-center mb-3">
                        <FiFilm className="text-white/20 text-4xl" />
                      </div>
                    )}
                    <h3 className="text-white/80 text-sm font-medium line-clamp-2 group-hover:text-white transition-colors">
                      {movie.title}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Trending Series */}
        {!loading && trendingSeries.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <FiTv className="text-white text-2xl" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white">{t('ongoingSeries')}</h2>
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
              >
                <Link
                  to="/series?ongoing=true"
                  className="text-white/60 hover:text-white flex items-center gap-2 transition-colors"
                >
                  {t('allSeries')} <FiArrowRight />
                </Link>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trendingSeries.map((series, index) => (
                <motion.div
                  key={series.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <Link to={`/series/${series.id}`}>
                    {series.posterUrl ? (
                      <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3]">
                        <img
                          src={series.posterUrl}
                          alt={series.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {series.isOngoing && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/90 text-white text-xs font-semibold rounded">
                            Идёт
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-semibold text-sm line-clamp-2">
                              {series.title}
                            </h3>
                            {series.averageRating && (
                              <div className="flex items-center gap-1 mt-2">
                                <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
                                <span className="text-white text-xs">{series.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[2/3] bg-white/5 rounded-lg flex items-center justify-center mb-3">
                        <FiTv className="text-white/20 text-4xl" />
                      </div>
                    )}
                    <h3 className="text-white/80 text-sm font-medium line-clamp-2 group-hover:text-white transition-colors">
                      {series.title}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Quick Navigation */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        >
                          <FiZap className="text-white text-3xl" />
                        </motion.div>
            <h2 className="text-3xl font-bold text-white">{t('quickNavigation')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="card cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Link to="/movies" className="block relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                    <FiFilm className="text-3xl text-white group-hover:text-black transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{t('movies')}</h3>
                    <p className="text-white/60">{t('catalog')}</p>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed">
                  {t('moviesDesc')}
                </p>
                <div className="mt-4 flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                  <span>{t('goTo')}</span>
                  <motion.div
                    className="group-hover:translate-x-1 transition-transform"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FiArrowRight />
                  </motion.div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="card cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Link to="/series" className="block relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                    <FiTv className="text-3xl text-white group-hover:text-black transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{t('series')}</h3>
                    <p className="text-white/60">{t('catalog')}</p>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed">
                  {t('seriesDesc')}
                </p>
                <div className="mt-4 flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                  <span>{t('goTo')}</span>
                  <motion.div
                    className="group-hover:translate-x-1 transition-transform"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                  >
                    <FiArrowRight />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Features for authenticated users */}
        {isAuthenticated && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          >
            {[
              { title: t('favorites'), desc: t('favorites'), link: '/profile', tab: 'favorites', icon: FiHeart },
              { title: t('myComments'), desc: t('myComments'), link: '/profile', tab: 'comments', icon: FiMessageSquare },
              { title: t('myRatings'), desc: t('myRatings'), link: '/profile', tab: 'ratings', icon: FiStar },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 + index * 0.15, duration: 0.7, ease: "easeOut" }}
                  whileHover={{ scale: 1.03, y: -8 }}
                  className="card cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Link to={feature.link} state={{ activeTab: feature.tab }} className="block relative z-10">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                    >
                      <Icon className="text-3xl text-white mb-3 group-hover:scale-110 transition-transform" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/80 transition-colors">{feature.title}</h3>
                    <p className="text-white/60">{feature.desc}</p>
                    <div className="mt-4 flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                      <span>{t('goTo')}</span>
                      <motion.div
                        className="group-hover:translate-x-1 transition-transform"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.3 }}
                      >
                        <FiArrowRight />
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;

