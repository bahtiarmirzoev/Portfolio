import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { seriesService } from '../../services/seriesService';
import { seriesCommentsService } from '../../services/seriesCommentsService';
import { seriesRatingsService } from '../../services/seriesRatingsService';
import { favoritesService } from '../../services/favoritesService';
import { useAuthStore } from '../../stores/authStore';
import { useLanguageStore } from '../../stores/languageStore';
import { FiTv, FiArrowLeft, FiPlay, FiCalendar, FiStar, FiMessageSquare, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { t } = useLanguageStore();
  const [series, setSeries] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadSeries();
    if (isAuthenticated) {
      loadUserRating();
      checkFavorite();
    }
    loadComments();
  }, [id, isAuthenticated]);

  const loadSeries = async () => {
    try {
      setLoading(true);
      const data = await seriesService.getById(id);
      setSeries(data);
    } catch (error) {
      toast.error('Сериал не найден');
      navigate('/series');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRating = async () => {
    try {
      const ratingData = await seriesRatingsService.getMyRating(id);
      if (ratingData && ratingData.myRating) {
        setUserRating(ratingData.myRating);
        setRating(ratingData.myRating);
      }
    } catch (error) {
      // Игнорируем ошибку
    }
  };

  const checkFavorite = async () => {
    try {
      const favorites = await favoritesService.getFavoriteSeries(1, 100);
      const favoriteIds = Array.isArray(favorites) ? favorites : [];
      setIsFavorite(favoriteIds.some(favId => favId === id || favId.toString() === id));
    } catch (error) {
      // Игнорируем ошибку, если не авторизован
    }
  };

  const loadComments = async () => {
    try {
      const data = await seriesCommentsService.getSeriesComments(id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleRate = async () => {
    if (!isAuthenticated) {
      toast.error(t('loginToRate'));
      navigate('/sign-in');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error(t('ratingRangeError'));
      return;
    }

    try {
      await seriesRatingsService.rateSeries(id, rating);
      setUserRating(rating);
      toast.success(t('ratingSaved'));
    } catch (error) {
      toast.error(t('ratingError'));
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      toast.error(t('loginToComment'));
      navigate('/sign-in');
      return;
    }

    if (!commentText.trim()) {
      toast.error(t('enterCommentText'));
      return;
    }

    try {
      await seriesCommentsService.createComment(id, commentText.trim());
      setCommentText('');
      setShowCommentForm(false);
      await loadComments();
      toast.success(t('commentAdded'));
    } catch (error) {
      toast.error(t('commentError'));
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(t('loginToRate'));
      navigate('/sign-in');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesService.removeSeriesFromFavorites(id);
        setIsFavorite(false);
        toast.success(t('removeFromFavorites'));
      } else {
        await favoritesService.addSeriesToFavorites(id);
        setIsFavorite(true);
        toast.success(t('addToFavorites'));
      }
    } catch (error) {
      toast.error(t('errorToggleFavorite'));
    }
  };

  const renderStars = (value, interactive = false) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <motion.button
        key={index}
        type={interactive ? 'button' : undefined}
        onClick={interactive ? () => setRating(index + 1) : undefined}
        whileHover={interactive ? { scale: 1.2 } : {}}
        whileTap={interactive ? { scale: 0.9 } : {}}
        className={`${
          index < value
            ? 'text-white fill-white'
            : 'text-white/20'
        } transition-colors duration-300`}
      >
        <FiStar size={interactive ? 28 : 20} />
      </motion.button>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!series) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center gap-2 mb-6"
        >
          <FiArrowLeft /> {t('back')}
        </motion.button>

        {/* Series Info */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Poster */}
            <div>
              {series.posterUrl ? (
                <img
                  src={series.posterUrl}
                  alt={series.title}
                  className="w-full rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-white/5 rounded-lg flex items-center justify-center">
                  <FiTv className="text-white/20 text-6xl" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold text-white">{series.title}</h1>
                {series.isOngoing && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold"
                  >
                    {t('ongoing')}
                  </motion.span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6 text-white/60">
                <span className="flex items-center gap-2">
                  <FiCalendar /> {series.yearOfRelease}
                  {series.yearOfEnd && ` - ${series.yearOfEnd}`}
                </span>
                {series.averageRating && (
                  <span className="flex items-center gap-1">
                    ⭐ {series.averageRating.toFixed(1)}
                  </span>
                )}
              </div>

              {series.description && (
                <p className="text-white/80 mb-6 leading-relaxed">{series.description}</p>
              )}

              {series.genres && series.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {series.genres.map((genre, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {series.actors && series.actors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white/60 text-sm mb-2">Актёры:</h3>
                  <div className="flex flex-wrap gap-2">
                    {series.actors.map((actor, idx) => (
                      <span key={idx} className="text-white/80 text-sm">
                        {actor.name}
                        {idx < series.actors.length - 1 && ','}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(series.totalSeasons || series.totalEpisodes) && (
                <div className="mb-6">
                  <div className="flex gap-6 text-white/80">
                    {series.totalSeasons && (
                      <div>
                        <span className="text-white/60 text-sm">{t('seasons')}: </span>
                        <span className="font-semibold">{series.totalSeasons}</span>
                      </div>
                    )}
                    {series.totalEpisodes && (
                      <div>
                        <span className="text-white/60 text-sm">{t('episodes')}: </span>
                        <span className="font-semibold">{series.totalEpisodes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                {series.trailerUrl && (
                  <motion.a
                    href={series.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FiPlay /> {t('trailer')}
                  </motion.a>
                )}
                {isAuthenticated && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                      isFavorite
                        ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <motion.div
                      animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <FiHeart className={isFavorite ? 'fill-current' : ''} />
                    </motion.div>
                    {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rating Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <FiStar />
            </motion.div>
            {t('rating')}
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-1">
              {renderStars(rating, true)}
            </div>
            <span className="text-white/80 font-semibold">{rating}/5</span>
            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRate}
                className="btn-primary"
              >
                {userRating ? t('changeRating') : t('rating')}
              </motion.button>
            ) : (
              <p className="text-white/60">{t('loginToRate')}</p>
            )}
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <FiMessageSquare />
              </motion.div>
              {t('comments')} ({comments.length})
            </h2>
            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCommentForm(!showCommentForm)}
                className="btn-primary"
              >
                {showCommentForm ? t('cancel') : t('addComment')}
              </motion.button>
            ) : (
              <Link to="/sign-in" className="btn-secondary">
                {t('loginToComment')}
              </Link>
            )}
          </div>

          <AnimatePresence>
            {showCommentForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6"
              >
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input-field min-h-[100px] mb-3"
                  placeholder={t('enterComment')}
                />
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddComment}
                  className="btn-primary"
                >
                  {t('send')}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {comments.length === 0 ? (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/60 text-center py-8"
              >
                {t('noComments')}
              </motion.p>
            ) : (
              comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <p className="text-white/80 mb-2">{comment.content}</p>
                  <p className="text-white/40 text-sm">
                    {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SeriesDetail;

