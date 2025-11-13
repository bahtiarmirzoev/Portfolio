import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { moviesService } from '../../services/moviesService';
import { commentsService } from '../../services/commentsService';
import { favoritesService } from '../../services/favoritesService';
import { ratingsService } from '../../services/ratingsService';
import { useAuthStore } from '../../stores/authStore';
import { useLanguageStore } from '../../stores/languageStore';
import { FiFilm, FiHeart, FiStar, FiMessageSquare, FiArrowLeft, FiPlay, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { t, translateGenre } = useLanguageStore();
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    loadMovie();
    if (isAuthenticated) {
      checkFavorite();
      loadUserRating();
    }
    loadComments();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (movie) {
      loadSimilarMovies();
    }
  }, [movie]);

  const loadMovie = async () => {
    try {
      setLoading(true);
      const data = await moviesService.getById(id);
      setMovie(data);
            } catch (error) {
              toast.error(t('movieNotFound'));
              navigate('/movies');
            } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const favorites = await favoritesService.getFavorites(1, 100);
      // favorites возвращает массив ID фильмов
      const favoriteIds = Array.isArray(favorites) ? favorites : [];
      setIsFavorite(favoriteIds.some(favId => favId === id || favId.toString() === id));
    } catch (error) {
      // Игнорируем ошибку, если не авторизован
    }
  };

  const loadUserRating = async () => {
    try {
      const ratingData = await ratingsService.getMyRating(id);
      const ratingValue = ratingData?.value ?? ratingData?.MyRating ?? ratingData?.myRating;
      if (ratingValue) {
        setUserRating(ratingValue);
        setRating(ratingValue);
      }
    } catch (error) {
      // Игнорируем ошибку, если пользователь не авторизован или нет рейтинга
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentsService.getMovieComments(id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadSimilarMovies = async () => {
    try {
      if (!movie) return;
      
      // Загружаем фильмы того же жанра
      if (movie.genres && movie.genres.length > 0) {
        const genre = movie.genres[0];
        const response = await moviesService.getAll({
          genre,
          take: 6,
        });
        // Исключаем текущий фильм
        const similar = (response.items || []).filter(m => m.id !== movie.id).slice(0, 5);
        setSimilarMovies(similar);
      } else {
        // Если нет жанра, просто загружаем последние фильмы
        const response = await moviesService.getAll({ take: 6 });
        const similar = (response.items || []).filter(m => m.id !== movie.id).slice(0, 5);
        setSimilarMovies(similar);
      }
    } catch (error) {
      console.error('Error loading similar movies:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(t('loginToRate')); // Используем существующий перевод
      navigate('/sign-in');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesService.removeFromFavorites(id);
        setIsFavorite(false);
        toast.success(t('removeFromFavorites'));
      } else {
        await favoritesService.addToFavorites(id);
        setIsFavorite(true);
        toast.success(t('addToFavorites'));
      }
    } catch (error) {
      toast.error(t('errorToggleFavorite'));
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
      await ratingsService.rateMovie(id, rating);
      setUserRating(rating);
      // Перезагружаем рейтинг после сохранения
      await loadUserRating();
      toast.success(t('ratingSaved'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('ratingError'));
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
      await commentsService.createComment(id, commentText);
      setCommentText('');
      setShowCommentForm(false);
      loadComments();
      toast.success(t('commentAdded'));
    } catch (error) {
      toast.error(t('commentError'));
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

  if (!movie) {
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

        {/* Movie Info */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Poster */}
            <div>
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-white/5 rounded-lg flex items-center justify-center">
                  <FiFilm className="text-white/20 text-6xl" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="md:col-span-2">
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
              >
                {movie.title}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 mb-6 text-white/60"
              >
                <span className="text-lg">{movie.year}</span>
                {movie.averageRating && (
                  <span className="flex items-center gap-2 text-lg">
                    <FiStar className="text-yellow-400 fill-yellow-400" size={20} />
                    <span className="text-white font-semibold">{movie.averageRating.toFixed(1)}</span>
                    <span className="text-white/40">/ 5.0</span>
                  </span>
                )}
              </motion.div>

              {movie.description && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-white/80 mb-6 leading-relaxed text-lg"
                >
                  {movie.description}
                </motion.p>
              )}

              {movie.genres && movie.genres.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap gap-2 mb-6"
                >
                  {movie.genres.map((genre, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + idx * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/80 text-sm font-medium transition-colors cursor-default"
                    >
                      {translateGenre(genre)}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {movie.actors && movie.actors.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mb-6"
                >
                  <h3 className="text-white/60 text-sm mb-3 font-semibold">Актёры:</h3>
                  <div className="flex flex-wrap gap-3">
                    {movie.actors.map((actor, idx) => (
                      <motion.span 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + idx * 0.05 }}
                        className="text-white/80 text-sm px-3 py-1 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {actor.name}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleFavorite}
                  className={`btn-secondary flex items-center gap-2 ${
                    isFavorite ? 'bg-white/20' : ''
                  }`}
                >
                  <motion.div
                    animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <FiHeart className={isFavorite ? 'fill-white' : ''} />
                  </motion.div>
                  {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
                </motion.button>

                {movie.trailerUrl && (
                  <motion.a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FiPlay /> {t('trailer')}
                  </motion.a>
                )}

                <motion.a
                  href={movie.watchUrl || '#'}
                  target={movie.watchUrl ? "_blank" : undefined}
                  rel={movie.watchUrl ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (!movie.watchUrl) {
                      e.preventDefault();
                      toast.error(t('watchUrlNotAvailable') || 'Ссылка для просмотра недоступна');
                    }
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all ${
                    movie.watchUrl
                      ? 'btn-primary'
                      : 'bg-white/5 border-white/20 text-white/60 cursor-not-allowed hover:bg-white/5'
                  }`}
                >
                  <FiExternalLink /> {t('watchMovie') || 'Смотреть фильм'}
                </motion.a>
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

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-6 mt-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">{t('similarMovies')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {similarMovies.map((similarMovie, index) => (
                <motion.div
                  key={similarMovie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <Link to={`/movies/${similarMovie.id}`}>
                    {similarMovie.posterUrl ? (
                      <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3]">
                        <img
                          src={similarMovie.posterUrl}
                          alt={similarMovie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-white font-semibold text-xs line-clamp-2">
                              {similarMovie.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[2/3] bg-white/5 rounded-lg mb-3 flex items-center justify-center">
                        <FiFilm className="text-white/20 text-3xl" />
                      </div>
                    )}
                    <h3 className="text-white/80 text-sm font-medium line-clamp-2 group-hover:text-white transition-colors">
                      {similarMovie.title}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MovieDetail;

