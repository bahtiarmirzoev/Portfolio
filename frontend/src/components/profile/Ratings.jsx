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

      const response = await moviesService.getAll({ skip: 0, take: 500 });
      const movieItems = Array.isArray(response)
        ? response
        : response?.items || response?.data || [];

      const ratingsData = await Promise.all(
        movieItems.map(async (movie) => {
          try {
            const myRating = await ratingsService.getMyRating(movie.id);
            if (!myRating || myRating.value === null || myRating.value === undefined) {
              return null;
            }

            let averageRating = myRating.averageRating;
            if (averageRating === undefined) {
              const overall = await ratingsService.getMovieRating(movie.id);
              averageRating = overall?.averageRating ?? overall?.value ?? null;
            }

            return {
              movie,
              value: myRating.value,
              averageRating,
            };
          } catch (error) {
            return null;
          }
        })
      );

      setRatings(ratingsData.filter(Boolean));
    } catch (error) {
      toast.error(t('errorLoadingRatings'));
      console.error(error);
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
      <div className="glass rounded-2xl p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
        <p className="text-white/60 mt-4">{t('loading')}</p>
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-12 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        >
          <FiStar className="mx-auto text-6xl text-white/20 mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('noRatings')}</h2>
        <p className="text-white/60">{t('noRatings')}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FiStar className="text-white" />
          </motion.div>
          {t('myRatings')}
        </h2>
        <p className="text-white/60">{t('total')}: {ratings.length}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ratings.map((rating, index) => (
          <motion.div
            key={rating.movie.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="card group"
          >
            <Link to={`/movies/${rating.movie.id}`} className="block">
              {rating.movie.posterUrl ? (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={rating.movie.posterUrl}
                  alt={rating.movie.title}
                  className="w-full h-48 object-cover rounded-lg mb-4 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-white/5 rounded-lg mb-4 flex items-center justify-center">
                  <FiFilm className="text-white/20 text-4xl" />
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white/80 transition-colors">{rating.movie.title}</h3>
            </Link>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">{t('yourRating')}:</span>
                <div className="flex gap-1">
                  {renderStars(rating.value)}
                </div>
                <span className="text-white font-semibold ml-2">{rating.value}/5</span>
              </div>
              
              {rating.averageRating && (
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm">{t('averageRating')}:</span>
                  <span className="text-white/80">{rating.averageRating.toFixed(1)}/5</span>
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

