import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ratingsService } from '../../services/ratingsService';
import { moviesService } from '../../services/moviesService';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiStar, FiFilm } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Ratings = () => {
  const { t } = useLanguage();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRatings();
  }, []);

  const loadUserRatings = async () => {
    try {
      setLoading(true);

      // Получаем все рейтинги пользователя
      const userRatings = await ratingsService.getMyRatings();
      
      if (!userRatings || userRatings.length === 0) {
        setRatings([]);
        return;
      }

      // Загружаем информацию о фильмах для каждого рейтинга
      const ratingsData = await Promise.all(
        userRatings.map(async (rating) => {
          try {
            const movie = await moviesService.getById(rating.movieId);
            if (!movie) return null;

            // Получаем средний рейтинг фильма
            let averageRating = null;
            try {
              const overall = await ratingsService.getMovieRating(rating.movieId);
              averageRating = overall?.averageRating ?? overall?.AverageRating ?? overall?.value ?? null;
            } catch (err) {
              // Игнорируем ошибки
            }

            return {
              movie,
              value: rating.value,
              averageRating,
            };
          } catch (error) {
            console.error(`Error loading movie ${rating.movieId}:`, error);
            return null;
          }
        })
      );

      setRatings(ratingsData.filter(Boolean));
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
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center"
            >
              <FiStar className="text-yellow-400" />
            </motion.div>
            {t('myRatings')}
          </h2>
          <p className="text-white/60">{t('total')}: <span className="text-white font-semibold">{ratings.length}</span></p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ratings.map((rating, index) => (
          <motion.div
            key={rating.movie.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.03 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-xl transition-all hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/10"
          >
            <Link to={`/movies/${rating.movie.id}`} className="block">
              <div className="relative overflow-hidden rounded-t-2xl">
                {rating.movie.posterUrl ? (
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={rating.movie.posterUrl}
                    alt={rating.movie.title}
                    className="w-full h-56 object-cover transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-56 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                    <FiFilm className="text-white/20 text-5xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                    {rating.movie.title}
                  </h3>
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

