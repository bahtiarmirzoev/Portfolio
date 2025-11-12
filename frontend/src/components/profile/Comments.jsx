import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { commentsService } from '../../services/commentsService';
import { seriesCommentsService } from '../../services/seriesCommentsService';
import { moviesService } from '../../services/moviesService';
import { seriesService } from '../../services/seriesService';
import { useLanguageStore } from '../../stores/languageStore';
import { FiMessageSquare, FiEdit2, FiTrash2, FiSave, FiX, FiFilm, FiTv } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Comments = () => {
  const { t } = useLanguageStore();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'movies', 'series'

  useEffect(() => {
    loadUserComments();
  }, [activeTab]);

  const loadUserComments = async () => {
    try {
      setLoading(true);
      const allComments = [];

      // Загружаем комментарии к фильмам
      if (activeTab === 'all' || activeTab === 'movies') {
        try {
          // Пока используем старый метод, так как нет эндпоинта для всех комментариев пользователя
          const movies = await moviesService.getAll({ take: 100 });
          for (const movie of movies.items || []) {
            try {
              const movieComments = await commentsService.getMovieComments(movie.id);
              const userComments = movieComments.map(comment => ({
                ...comment,
                movie: movie,
                type: 'movie',
              }));
              allComments.push(...userComments);
            } catch (error) {
              // Пропускаем фильмы без комментариев
            }
          }
        } catch (error) {
          console.error('Error loading movie comments:', error);
        }
      }

      // Загружаем комментарии к сериалам
      if (activeTab === 'all' || activeTab === 'series') {
        try {
          const seriesComments = await seriesCommentsService.getMyComments();
          const seriesCommentsWithDetails = await Promise.all(
            (seriesComments || []).map(async (comment) => {
              try {
                const series = await seriesService.getById(comment.seriesId);
                return {
                  ...comment,
                  series: series,
                  type: 'series',
                };
              } catch (error) {
                return null;
              }
            })
          );
          allComments.push(...seriesCommentsWithDetails.filter(Boolean));
        } catch (error) {
          console.error('Error loading series comments:', error);
        }
      }

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

  const handleSave = async (comment) => {
    try {
      let updated;
      if (comment.type === 'movie') {
        updated = await commentsService.updateComment(comment.movieId, comment.id, editContent);
      } else {
        updated = await seriesCommentsService.updateComment(comment.seriesId, comment.id, editContent);
      }
      setComments(prev =>
        prev.map(c => c.id === comment.id ? { ...c, ...updated } : c)
      );
      setEditingId(null);
      setEditContent('');
      toast.success(t('commentUpdated'));
    } catch (error) {
      toast.error(t('commentError'));
    }
  };

  const handleDelete = async (comment) => {
    if (!window.confirm(t('delete') + '?')) return;

    try {
      if (comment.type === 'movie') {
        await commentsService.deleteComment(comment.movieId, comment.id);
      } else {
        await seriesCommentsService.deleteComment(comment.seriesId, comment.id);
      }
      setComments(prev => prev.filter(c => c.id !== comment.id));
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
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <FiMessageSquare className="text-white" />
          </motion.div>
          {t('myComments')}
        </h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['all', 'movies', 'series'].map((tab) => {
            const count = tab === 'all' 
              ? comments.length 
              : comments.filter(c => c.type === tab.slice(0, -1)).length;
            return (
              <motion.button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setComments([]);
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
          {activeTab === 'all' && `${t('total')}: ${comments.length}`}
          {activeTab === 'movies' && `${t('movies')}: ${comments.filter(c => c.type === 'movie').length}`}
          {activeTab === 'series' && `${t('series')}: ${comments.filter(c => c.type === 'series').length}`}
        </p>
      </motion.div>

      <div className="space-y-4">
        {comments
          .filter(comment => {
            if (activeTab === 'all') return true;
            if (activeTab === 'movies') return comment.type === 'movie';
            if (activeTab === 'series') return comment.type === 'series';
            return true;
          })
          .map((comment, index) => (
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
                <Link to={comment.type === 'movie' ? `/movies/${comment.movieId}` : `/series/${comment.seriesId}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {comment.type === 'movie' ? (
                      <FiFilm className="text-white/40" size={16} />
                    ) : (
                      <FiTv className="text-white/40" size={16} />
                    )}
                    <h3 className="text-lg font-semibold text-white hover:text-white/80 transition-colors">
                      {comment.type === 'movie' ? (comment.movie?.title || t('movie')) : (comment.series?.title || t('series'))}
                    </h3>
                  </div>
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
                      onClick={() => handleDelete(comment)}
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
                      onClick={() => handleSave(comment)}
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

