import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { favoritesService } from '../../services/favoritesService';
import { moviesService } from '../../services/moviesService';
import { seriesService } from '../../services/seriesService';
import { useLanguageStore } from '../../stores/languageStore';
import { FiHeart, FiTrash2, FiFilm, FiStar, FiTv } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Favorites = () => {
  const { t } = useLanguageStore();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'movies', 'series'

  useEffect(() => {
    loadFavorites();
  }, [page, activeTab]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      let movieIds = [];
      let seriesIds = [];

      if (activeTab === 'all' || activeTab === 'movies') {
        const movies = await favoritesService.getFavorites(page, 10);
        movieIds = Array.isArray(movies) ? movies : [];
      }

      if (activeTab === 'all' || activeTab === 'series') {
        const series = await favoritesService.getFavoriteSeries(page, 10);
        seriesIds = Array.isArray(series) ? series : [];
      }

      if (movieIds.length === 0 && seriesIds.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Загружаем детали фильмов и сериалов
      const moviesPromises = movieIds.map(id => moviesService.getById(id).then(m => ({ ...m, type: 'movie' })));
      const seriesPromises = seriesIds.map(id => seriesService.getById(id).then(s => ({ ...s, type: 'series' })));
      
      const [movies, series] = await Promise.all([
        Promise.all(moviesPromises),
        Promise.all(seriesPromises)
      ]);
      
      const allFavorites = [...movies, ...series];
      
      if (page === 1) {
        setFavorites(allFavorites);
      } else {
        setFavorites(prev => [...prev, ...allFavorites]);
      }
      
      setHasMore(allFavorites.length === 10);
    } catch (error) {
      toast.error(t('errorLoadingFavorites'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item) => {
    try {
      if (item.type === 'movie') {
        await favoritesService.removeFromFavorites(item.id);
      } else {
        await favoritesService.removeSeriesFromFavorites(item.id);
      }
      setFavorites(prev => prev.filter(f => f.id !== item.id));
      toast.success(t('removeFromFavorites'));
    } catch (error) {
      toast.error(t('errorLoadingFavorites'));
    }
  };

  if (loading && favorites.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
        <p className="text-white/60 mt-4">{t('loading')}</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-12 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FiHeart className="mx-auto text-6xl text-white/20 mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('noFavorites')}</h2>
        <p className="text-white/60">{t('noFavorites')}</p>
      </motion.div>
    );
  }

  const moviesCount = favorites.filter(f => f.type === 'movie').length;
  const seriesCount = favorites.filter(f => f.type === 'series').length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FiHeart className="text-white" />
          </motion.div>
          {t('favorites')}
        </h2>
        
        {}
        <div className="flex gap-2 mb-4">
          {['all', 'movies', 'series'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
                setFavorites([]);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {tab === 'all' ? t('all') : tab === 'movies' ? t('movies') : t('series')}
            </motion.button>
          ))}
        </div>
        
        <p className="text-white/60">
          {activeTab === 'all' && `${t('total')}: ${favorites.length}`}
          {activeTab === 'movies' && `${t('movies')}: ${moviesCount}`}
          {activeTab === 'series' && `${t('series')}: ${seriesCount}`}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites
          .filter(item => {
            if (activeTab === 'all') return true;
            if (activeTab === 'movies') return item.type === 'movie';
            if (activeTab === 'series') return item.type === 'series';
            return true;
          })
          .map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="card group relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRemove(movie.id)}
                className="bg-black/50 hover:bg-red-500/20 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              >
                <FiTrash2 size={18} />
              </motion.button>
            </div>

            <Link to={movie.type === 'movie' ? `/movies/${movie.id}` : `/series/${movie.id}`} className="block">
              {movie.posterUrl ? (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-64 object-cover rounded-lg mb-4 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-64 bg-white/5 rounded-lg mb-4 flex items-center justify-center">
                  {movie.type === 'movie' ? (
                    <FiFilm className="text-white/20 text-6xl" />
                  ) : (
                    <FiTv className="text-white/20 text-6xl" />
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                {movie.type === 'movie' ? (
                  <FiFilm className="text-white/40" size={16} />
                ) : (
                  <FiTv className="text-white/40" size={16} />
                )}
                <h3 className="text-xl font-bold text-white group-hover:text-white/80 transition-colors">{movie.title}</h3>
              </div>
              <p className="text-white/60 text-sm mb-3 line-clamp-2">{movie.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">
                  {movie.type === 'movie' ? movie.year : movie.yearOfRelease}
                  {movie.type === 'series' && movie.isOngoing && (
                    <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Идёт</span>
                  )}
                </span>
                {movie.averageRating && (
                  <span className="text-white/60 flex items-center gap-1">
                    <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
                    {movie.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
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
    </div>
  );
};

export default Favorites;

