import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ratingsService } from '../../services/ratingsService';
import { seriesRatingsService } from '../../services/seriesRatingsService';
import { moviesService } from '../../services/moviesService';
import { seriesService } from '../../services/seriesService';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiStar, FiFilm, FiTv } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Ratings = () => {
  const { t } = useLanguage();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'movies', 'series'

  useEffect(() => {
    loadUserRatings();
  }, [activeTab]);

  const loadUserRatings = async () => {
    try {
      setLoading(true);
      const allRatings = [];

      // Загружаем рейтинги фильмов
      if (activeTab === 'all' || activeTab === 'movies') {
        try {
          const userRatings = await ratingsService.getMyRatings();
          
          if (userRatings && userRatings.length > 0) {
            const movieRatings = await Promise.all(
              userRatings.map(async (rating) => {
                try {
                  const movie = await moviesService.getById(rating.movieId);
                  if (!movie) return null;

                  let averageRating = null;
                  try {
                    const overall = await ratingsService.getMovieRating(rating.movieId);
                    averageRating = overall?.averageRating ?? overall?.AverageRating ?? overall?.value ?? null;
                  } catch (err) {
                    // Игнорируем ошибки
                  }

                  return {
                    item: movie,
                    type: 'movie',
                    value: rating.value,
                    averageRating,
                  };
                } catch (error) {
                  console.error(`Error loading movie ${rating.movieId}:`, error);
                  return null;
                }
              })
            );
            allRatings.push(...movieRatings.filter(Boolean));
          }
        } catch (error) {
          console.error('Error loading movie ratings:', error);
        }
      }

      // Загружаем рейтинги сериалов
      if (activeTab === 'all' || activeTab === 'series') {
        try {
          const userRatings = await seriesRatingsService.getMyRatings();
          
          if (userRatings && userRatings.length > 0) {
            const seriesRatings = await Promise.all(
              userRatings.map(async (rating) => {
                try {
                  const series = await seriesService.getById(rating.seriesId);
                  if (!series) return null;

                  let averageRating = null;
                  try {
                    const overall = await seriesRatingsService.getSeriesRating(rating.seriesId);
                    averageRating = overall?.averageRating ?? overall?.AverageRating ?? overall?.value ?? null;
                  } catch (err) {
                    // Игнорируем ошибки
                  }

                  return {
                    item: series,
                    type: 'series',
                    value: rating.value,
                    averageRating,
                  };
                } catch (error) {
                  console.error(`Error loading series ${rating.seriesId}:`, error);
                  return null;
                }
              })
            );
            allRatings.push(...seriesRatings.filter(Boolean));
          }
        } catch (error) {
          console.error('Error loading series ratings:', error);
        }
      }

      setRatings(allRatings);
    } catch (error) {
      toast.error(t('errorLoadingRatings'));
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <FiStar
        key={index}
        className={`${
          index < value
            ? 'text-white fill-white'
            : 'text-white/20'
        } transition-colors duration-300`}
        size={20}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto"
          />
          <p className="text-white/60">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-2xl" />
          <div className="relative w-24 h-24 rounded-full border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 flex items-center justify-center">
            <FiStar className="text-5xl text-yellow-500/50" />
          </div>
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('noRatings')}</h2>
          <p className="text-white/60">{t('noRatingsDescription') || 'Вы еще не оценили ни одного фильма'}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center"
            >
              <FiStar className="text-yellow-400" />
            </motion.div>
            {t('myRatings')}
          </h2>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          {['all', 'movies', 'series'].map((tab) => {
            const count = tab === 'all' 
              ? ratings.length 
              : ratings.filter(r => r.type === tab.slice(0, -1)).length;
            return (
              <motion.button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setRatings([]);
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
                {` (${count})`}
              </motion.button>
            );
          })}
        </div>
        
        <p className="text-white/60">
          {activeTab === 'all' && `${t('total')}: ${ratings.length}`}
          {activeTab === 'movies' && `${t('movies')}: ${ratings.filter(r => r.type === 'movie').length}`}
          {activeTab === 'series' && `${t('series')}: ${ratings.filter(r => r.type === 'series').length}`}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ratings
          .filter(rating => {
            if (activeTab === 'all') return true;
            if (activeTab === 'movies') return rating.type === 'movie';
            if (activeTab === 'series') return rating.type === 'series';
            return true;
          })
          .map((rating, index) => (
          <motion.div
            key={rating.item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.03 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-xl transition-all hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/10"
          >
            <Link to={rating.type === 'movie' ? `/movies/${rating.item.id}` : `/series/${rating.item.id}`} className="block">
              <div className="relative overflow-hidden rounded-t-2xl">
                {rating.item.posterUrl ? (
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={rating.item.posterUrl}
                    alt={rating.item.title}
                    className="w-full h-56 object-cover transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-56 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                    {rating.type === 'movie' ? (
                      <FiFilm className="text-white/20 text-5xl" />
                    ) : (
                      <FiTv className="text-white/20 text-5xl" />
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    {rating.type === 'movie' ? (
                      <FiFilm className="text-white/60" size={16} />
                    ) : (
                      <FiTv className="text-white/60" size={16} />
                    )}
                    <h3 className="text-xl font-bold text-white line-clamp-2 group-hover:text-yellow-400 transition-colors">
                      {rating.item.title}
                    </h3>
                  </div>
                  {rating.type === 'series' && rating.item.isOngoing && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Идёт</span>
                  )}
                </div>
              </div>
            </Link>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm">{t('yourRating')}:</span>
                  <div className="flex gap-1">
                    {renderStars(rating.value)}
                  </div>
                </div>
                <span className="text-yellow-400 font-bold text-lg">{rating.value}/5</span>
              </div>
              
              {rating.averageRating && (
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-white/60 text-sm">{t('averageRating')}:</span>
                  <span className="text-white/80 font-semibold">{rating.averageRating.toFixed(1)}/5</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Ratings;

