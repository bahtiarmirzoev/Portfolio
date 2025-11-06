import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { commentsService } from '../../services/commentsService';
import { moviesService } from '../../services/moviesService';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiMessageSquare, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Comments = () => {
  const { t } = useLanguage();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadUserComments();
  }, []);

  const loadUserComments = async () => {
    try {
      setLoading(true);
      // Получаем все фильмы и их комментарии
      // В реальном приложении лучше иметь эндпоинт для получения комментариев пользователя
      const movies = await moviesService.getAll({ take: 100 });
      const allComments = [];

      for (const movie of movies.items || []) {
        try {
          const movieComments = await commentsService.getMovieComments(movie.id);
          const userComments = movieComments.map(comment => ({
            ...comment,
            movie: movie,
          }));
          allComments.push(...userComments);
        } catch (error) {
          // Пропускаем фильмы без комментариев
        }
      }

      // Фильтруем комментарии текущего пользователя
      // В реальном приложении это должно делаться на бэкенде через отдельный эндпоинт
      // Пока показываем все комментарии, так как нет способа получить userId из токена на фронтенде
      // В продакшене нужен эндпоинт GET /api/users/me/comments
      setComments(allComments);
    } catch (error) {
      toast.error(t('errorLoadingComments'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSave = async (movieId, commentId) => {
    try {
      const updated = await commentsService.updateComment(movieId, commentId, editContent);
      setComments(prev =>
        prev.map(c => c.id === commentId ? { ...c, ...updated } : c)
      );
      setEditingId(null);
      setEditContent('');
      toast.success(t('commentUpdated'));
    } catch (error) {
      toast.error(t('commentError'));
    }
  };

  const handleDelete = async (movieId, commentId) => {
    if (!window.confirm(t('delete') + '?')) return;

    try {
      await commentsService.deleteComment(movieId, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success(t('commentDeleted'));
    } catch (error) {
      toast.error(t('commentError'));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
        <p className="text-white/60 mt-4">{t('loading')}</p>
      </div>
    );
  }

  if (comments.length === 0) {
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
          <FiMessageSquare className="mx-auto text-6xl text-white/20 mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('noComments')}</h2>
        <p className="text-white/60">{t('noComments')}</p>
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
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FiMessageSquare className="text-white" />
          </motion.div>
          {t('myComments')}
        </h2>
        <p className="text-white/60">{t('total')}: {comments.length}</p>
      </motion.div>

      <div className="space-y-4">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            whileHover={{ x: 5 }}
            className="card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link to={`/movies/${comment.movieId}`}>
                  <h3 className="text-lg font-semibold text-white mb-1 hover:text-white/80 transition-colors">
                    {comment.movie?.title || t('movie')}
                  </h3>
                </Link>
                <p className="text-white/40 text-sm">
                  {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <span className="ml-2">({t('changed')})</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {editingId !== comment.id && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(comment)}
                      className="text-white/60 hover:text-white transition-colors p-2"
                    >
                      <FiEdit2 size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(comment.movieId, comment.id)}
                      className="text-white/60 hover:text-red-400 transition-colors p-2"
                    >
                      <FiTrash2 size={18} />
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {editingId === comment.id ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input-field min-h-[100px] resize-none"
                    placeholder={t('enterComment')}
                  />
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSave(comment.movieId, comment.id)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <FiSave /> {t('save')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <FiX /> {t('cancel')}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/80 leading-relaxed"
                >
                  {comment.content}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Comments;

