import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useLanguageStore } from '../../stores/languageStore';
import { adminService } from '../../services/adminService';
import { moviesService } from '../../services/moviesService';
import { seriesService } from '../../services/seriesService';
import { actorsService } from '../../services/actorsService';
import { storageService } from '../../services/storageService';
import { 
  FiFilm, 
  FiTv, 
  FiUser, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiShield,
  FiX,
  FiSave,
  FiUpload
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { isAdmin } = useAuthStore();
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState('movies');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [posterUploadLoading, setPosterUploadLoading] = useState(false);
  const [posterUploadError, setPosterUploadError] = useState('');

  // Movies state
  const [movies, setMovies] = useState([]);
  const [movieForm, setMovieForm] = useState({
    title: '',
    year: new Date().getFullYear(),
    description: '',
    posterUrl: '',
    trailerUrl: '',
    genres: [],
    actors: []
  });

  // Series state
  const [series, setSeries] = useState([]);
  const [seriesForm, setSeriesForm] = useState({
    title: '',
    yearOfRelease: new Date().getFullYear(),
    yearOfEnd: null,
    description: '',
    posterUrl: '',
    trailerUrl: '',
    genres: [],
    actors: [],
    totalSeasons: null,
    totalEpisodes: null,
    isOngoing: false
  });

  // Actors state
  const [actors, setActors] = useState([]);
  const [actorForm, setActorForm] = useState({
    name: '',
    dateOfBirth: '',
    biography: ''
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 text-center max-w-md"
        >
          <FiShield className="text-6xl text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Доступ запрещен</h2>
          <p className="text-white/60">У вас нет прав администратора для доступа к этой панели.</p>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'movies', label: 'Фильмы', icon: FiFilm },
    { id: 'series', label: 'Сериалы', icon: FiTv },
    { id: 'actors', label: 'Актеры', icon: FiUser },
  ];

  const loadMovies = async () => {
    try {
      setLoading(true);
      const response = await moviesService.getAll({ take: 100 });
      setMovies(response.items || []);
    } catch (error) {
      toast.error('Ошибка загрузки фильмов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeries = async () => {
    try {
      setLoading(true);
      const response = await seriesService.getAll({ take: 100 });
      setSeries(response.items || []);
    } catch (error) {
      toast.error('Ошибка загрузки сериалов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadActors = async () => {
    try {
      setLoading(true);
      const { items } = await actorsService.getAll({ pageSize: 200 });
      setActors(Array.isArray(items) ? items : []);
    } catch (error) {
      toast.error('Ошибка загрузки актеров');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovie = async () => {
    try {
      setLoading(true);
      const response = await adminService.createMovie({
        ...movieForm,
        genres: movieForm.genres.filter(g => g.trim()),
        actors: movieForm.actors.filter(a => a.trim())
      });
      toast.success('Фильм создан успешно!');
      setShowCreateModal(false);
      resetMovieForm();
      await loadMovies();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Ошибка создания фильма';
      toast.error(errorMessage);
      console.error('Error creating movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMovie = async () => {
    try {
      setLoading(true);
      const response = await adminService.updateMovie(editingItem.id, {
        ...movieForm,
        genres: movieForm.genres.filter(g => g.trim()),
        actors: movieForm.actors.filter(a => a.trim())
      });
      toast.success('Фильм обновлен успешно!');
      setShowEditModal(false);
      setEditingItem(null);
      resetMovieForm();
      await loadMovies();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Ошибка обновления фильма';
      toast.error(errorMessage);
      console.error('Error updating movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот фильм?')) return;
    
    try {
      setLoading(true);
      await adminService.deleteMovie(id);
      toast.success('Фильм удален успешно!');
      await loadMovies();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Ошибка удаления фильма';
      toast.error(errorMessage);
      console.error('Error deleting movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeries = async () => {
    try {
      setLoading(true);
      await adminService.createSeries({
        ...seriesForm,
        genres: seriesForm.genres.filter(g => g.trim()),
        actors: seriesForm.actors.filter(a => a.trim())
      });
      toast.success('Сериал создан успешно!');
      setShowCreateModal(false);
      resetSeriesForm();
      await loadSeries();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Ошибка создания сериала';
      toast.error(errorMessage);
      console.error('Error creating series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSeries = async () => {
    try {
      setLoading(true);
      await adminService.updateSeries(editingItem.id, {
        ...seriesForm,
        genres: seriesForm.genres.filter(g => g.trim()),
        actors: seriesForm.actors.filter(a => a.trim())
      });
      toast.success('Сериал обновлен успешно!');
      setShowEditModal(false);
      setEditingItem(null);
      resetSeriesForm();
      await loadSeries();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Ошибка обновления сериала';
      toast.error(errorMessage);
      console.error('Error updating series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeries = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот сериал?')) return;
    
    try {
      setLoading(true);
      await adminService.deleteSeries(id);
      toast.success('Сериал удален успешно!');
      await loadSeries();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Ошибка удаления сериала';
      toast.error(errorMessage);
      console.error('Error deleting series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActor = async () => {
    try {
      setLoading(true);
      const payload = {
        name: actorForm.name.trim(),
        dateOfBirth: actorForm.dateOfBirth && actorForm.dateOfBirth.trim() !== '' 
          ? actorForm.dateOfBirth 
          : null,
        biography: actorForm.biography && actorForm.biography.trim() !== '' 
          ? actorForm.biography.trim() 
          : null
      };
      
      await adminService.createActor(payload);
      toast.success('Актер создан успешно!');
      setShowCreateModal(false);
      resetActorForm();
      await loadActors();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Ошибка создания актера';
      toast.error(errorMessage);
      console.error('Error creating actor:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateActor = async () => {
    try {
      setLoading(true);
      const payload = {
        name: actorForm.name.trim(),
        dateOfBirth: actorForm.dateOfBirth && actorForm.dateOfBirth.trim() !== '' 
          ? actorForm.dateOfBirth 
          : null,
        biography: actorForm.biography && actorForm.biography.trim() !== '' 
          ? actorForm.biography.trim() 
          : null
      };
      
      await adminService.updateActor(editingItem.id, payload);
      toast.success('Актер обновлен успешно!');
      setShowEditModal(false);
      setEditingItem(null);
      resetActorForm();
      await loadActors();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Ошибка обновления актера';
      toast.error(errorMessage);
      console.error('Error updating actor:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handlePosterFileUpload = async (event, target) => {
    const input = event.target;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    setPosterUploadError('');

    try {
      setPosterUploadLoading(true);
      
      console.log('Uploading poster:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const { url } = await storageService.uploadPoster(file);

      console.log('Poster uploaded successfully:', url);

      if (target === 'movies') {
        setMovieForm((prev) => ({ ...prev, posterUrl: url }));
      } else {
        setSeriesForm((prev) => ({ ...prev, posterUrl: url }));
      }

      toast.success(t?.('posterUploaded') || 'Постер загружен');
    } catch (error) {
      console.error('Poster upload failed:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let message = t?.('posterUploadFailed') || 'Не удалось загрузить постер';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        // Если есть детальная ошибка от S3
        const s3Error = error.response.data.error;
        if (s3Error.includes('bucket') || s3Error.includes('Bucket')) {
          message = 'Ошибка S3: Проверьте настройки bucket (название, регион, права доступа)';
        } else if (s3Error.includes('AccessDenied') || s3Error.includes('access')) {
          message = 'Ошибка доступа к S3: Проверьте права IAM пользователя';
        } else if (s3Error.includes('InvalidAccessKeyId') || s3Error.includes('SignatureDoesNotMatch')) {
          message = 'Ошибка авторизации S3: Проверьте Access Key и Secret Key';
        } else {
          message = error.response.data.message || s3Error;
        }
      } else if (error.message) {
        message = error.message;
      }
      
      setPosterUploadError(message);
      toast.error(message);
    } finally {
      setPosterUploadLoading(false);
      if (input) {
        input.value = '';
      }
    }
  };

  const resetMovieForm = () => {
    setMovieForm({
      title: '',
      year: new Date().getFullYear(),
      description: '',
      posterUrl: '',
      trailerUrl: '',
      genres: [],
      actors: []
    });
    setPosterUploadError('');
    setPosterUploadLoading(false);
  };

  const resetSeriesForm = () => {
    setSeriesForm({
      title: '',
      yearOfRelease: new Date().getFullYear(),
      yearOfEnd: null,
      description: '',
      posterUrl: '',
      trailerUrl: '',
      genres: [],
      actors: [],
      totalSeasons: null,
      totalEpisodes: null,
      isOngoing: false
    });
    setPosterUploadError('');
    setPosterUploadLoading(false);
  };

  const resetActorForm = () => {
    setActorForm({
      name: '',
      dateOfBirth: '',
      biography: ''
    });
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setPosterUploadError('');
    setPosterUploadLoading(false);
    if (activeTab === 'movies') {
      setMovieForm({
        title: item.title || '',
        year: item.year || new Date().getFullYear(),
        description: item.description || '',
        posterUrl: item.posterUrl || '',
        trailerUrl: item.trailerUrl || '',
        genres: item.genres || [],
        actors: item.actors?.map(a => a.name || a) || []
      });
    } else if (activeTab === 'series') {
      setSeriesForm({
        title: item.title || '',
        yearOfRelease: item.yearOfRelease || new Date().getFullYear(),
        yearOfEnd: item.yearOfEnd || null,
        description: item.description || '',
        posterUrl: item.posterUrl || '',
        trailerUrl: item.trailerUrl || '',
        genres: item.genres || [],
        actors: item.actors?.map(a => a.name || a) || [],
        totalSeasons: item.totalSeasons || null,
        totalEpisodes: item.totalEpisodes || null,
        isOngoing: item.isOngoing || false
      });
    } else if (activeTab === 'actors') {
      setActorForm({
        name: item.name || '',
        dateOfBirth: item.dateOfBirth || '',
        biography: item.biography || ''
      });
    }
    setShowEditModal(true);
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'movies') loadMovies();
    else if (activeTab === 'series') loadSeries();
    else if (activeTab === 'actors') loadActors();
  }, [activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass rounded-2xl p-6 mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <FiShield className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Админ Панель</h1>
              <p className="text-white/60">Управление контентом</p>
            </div>
          </div>
        </motion.header>

        {/* Tabs */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPosterUploadError('');
                    setPosterUploadLoading(false);
                    if (tab.id === 'movies') loadMovies();
                    else if (tab.id === 'series') loadSeries();
                    else if (tab.id === 'actors') loadActors();
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {activeTab === 'movies' && 'Фильмы'}
              {activeTab === 'series' && 'Сериалы'}
              {activeTab === 'actors' && 'Актеры'}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (activeTab === 'movies') resetMovieForm();
                else if (activeTab === 'series') resetSeriesForm();
                else if (activeTab === 'actors') resetActorForm();
                setPosterUploadError('');
                setPosterUploadLoading(false);
                setShowCreateModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus size={18} />
              Создать
            </motion.button>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}

          {/* Movies List */}
          {activeTab === 'movies' && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <h3 className="text-white font-semibold mb-2">{movie.title}</h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{movie.description}</p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEditModal(movie)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2"
                    >
                      <FiEdit size={16} />
                      Редактировать
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteMovie(movie.id)}
                      className="btn-secondary text-red-400 hover:text-red-300 p-2"
                    >
                      <FiTrash2 size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Series List */}
          {activeTab === 'series' && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {series.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEditModal(item)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2"
                    >
                      <FiEdit size={16} />
                      Редактировать
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteSeries(item.id)}
                      className="btn-secondary text-red-400 hover:text-red-300 p-2"
                    >
                      <FiTrash2 size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Actors List */}
          {activeTab === 'actors' && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actors.map((actor) => (
                <motion.div
                  key={actor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <h3 className="text-white font-semibold mb-2">{actor.name}</h3>
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{actor.biography}</p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEditModal(actor)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2"
                    >
                      <FiEdit size={16} />
                      Редактировать
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setEditingItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {showEditModal ? 'Редактировать' : 'Создать'}{' '}
                  {activeTab === 'movies' && 'фильм'}
                  {activeTab === 'series' && 'сериал'}
                  {activeTab === 'actors' && 'актера'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Movie Form */}
              {activeTab === 'movies' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2">Название *</label>
                    <input
                      type="text"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Название фильма"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 mb-2">Год *</label>
                      <input
                        type="number"
                        value={movieForm.year}
                        onChange={(e) => setMovieForm({ ...movieForm, year: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Описание</label>
                    <textarea
                      value={movieForm.description}
                      onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Описание фильма"
                    />
                  </div>
                  <div className="border border-white/20 rounded-lg p-4 bg-white/5">
                    <label className="block text-white font-semibold mb-3">
                      <FiUpload className="inline mr-2" size={18} />
                      Постер фильма
                    </label>
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <label
                          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-dashed border-white/30 bg-white/5 text-white transition-all ${
                            posterUploadLoading 
                              ? 'opacity-60 cursor-not-allowed' 
                              : 'cursor-pointer hover:bg-white/10 hover:border-white/50'
                          }`}
                        >
                          <FiUpload size={20} />
                          <span className="font-medium">
                            {posterUploadLoading ? (t?.('loading') || 'Загрузка...') : t?.('uploadPoster') || 'Загрузить файл'}
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="hidden"
                            onChange={(e) => handlePosterFileUpload(e, 'movies')}
                            disabled={posterUploadLoading}
                          />
                        </label>
                        {movieForm.posterUrl && (
                          <div className="relative">
                            <img
                              src={movieForm.posterUrl}
                              alt="Превью постера"
                              className="h-32 w-24 rounded-lg border-2 border-white/20 object-cover shadow-xl"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setMovieForm({ ...movieForm, posterUrl: '' })}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                              title="Удалить постер"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Или введите URL вручную:</label>
                        <input
                          type="url"
                          value={movieForm.posterUrl}
                          onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="https://example.com/poster.jpg"
                        />
                      </div>
                      {posterUploadError && activeTab === 'movies' && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                          <p className="text-sm text-red-300">{posterUploadError}</p>
                        </div>
                      )}
                      {posterUploadLoading && (
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          <span>Загрузка файла на сервер...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">URL трейлера</label>
                    <input
                      type="url"
                      value={movieForm.trailerUrl}
                      onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Жанры (через запятую) *</label>
                    <input
                      type="text"
                      value={movieForm.genres.join(', ')}
                      onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value.split(',').map(g => g.trim()) })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Драма, Комедия, Боевик"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Актеры (через запятую)</label>
                    <input
                      type="text"
                      value={movieForm.actors.join(', ')}
                      onChange={(e) => setMovieForm({ ...movieForm, actors: e.target.value.split(',').map(a => a.trim()) })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Имя актера 1, Имя актера 2"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={showEditModal ? handleUpdateMovie : handleCreateMovie}
                    disabled={loading || !movieForm.title || !movieForm.genres.length}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                  >
                    <FiSave size={18} />
                    {showEditModal ? 'Сохранить' : 'Создать'}
                  </motion.button>
                </div>
              )}

              {/* Series Form */}
              {activeTab === 'series' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2">Название *</label>
                    <input
                      type="text"
                      value={seriesForm.title}
                      onChange={(e) => setSeriesForm({ ...seriesForm, title: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Название сериала"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 mb-2">Год выхода *</label>
                      <input
                        type="number"
                        value={seriesForm.yearOfRelease}
                        onChange={(e) => setSeriesForm({ ...seriesForm, yearOfRelease: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Год окончания</label>
                      <input
                        type="number"
                        value={seriesForm.yearOfEnd || ''}
                        onChange={(e) => setSeriesForm({ ...seriesForm, yearOfEnd: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Описание</label>
                    <textarea
                      value={seriesForm.description}
                      onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Описание сериала"
                    />
                  </div>
                  <div className="border border-white/20 rounded-lg p-4 bg-white/5">
                    <label className="block text-white font-semibold mb-3">
                      <FiUpload className="inline mr-2" size={18} />
                      Постер сериала
                    </label>
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <label
                          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-dashed border-white/30 bg-white/5 text-white transition-all ${
                            posterUploadLoading 
                              ? 'opacity-60 cursor-not-allowed' 
                              : 'cursor-pointer hover:bg-white/10 hover:border-white/50'
                          }`}
                        >
                          <FiUpload size={20} />
                          <span className="font-medium">
                            {posterUploadLoading ? (t?.('loading') || 'Загрузка...') : t?.('uploadPoster') || 'Загрузить файл'}
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="hidden"
                            onChange={(e) => handlePosterFileUpload(e, 'series')}
                            disabled={posterUploadLoading}
                          />
                        </label>
                        {seriesForm.posterUrl && (
                          <div className="relative">
                            <img
                              src={seriesForm.posterUrl}
                              alt="Превью постера"
                              className="h-32 w-24 rounded-lg border-2 border-white/20 object-cover shadow-xl"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setSeriesForm({ ...seriesForm, posterUrl: '' })}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                              title="Удалить постер"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Или введите URL вручную:</label>
                        <input
                          type="url"
                          value={seriesForm.posterUrl}
                          onChange={(e) => setSeriesForm({ ...seriesForm, posterUrl: e.target.value })}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="https://example.com/poster.jpg"
                        />
                      </div>
                      {posterUploadError && activeTab === 'series' && (
                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                          <p className="text-sm text-red-300">{posterUploadError}</p>
                        </div>
                      )}
                      {posterUploadLoading && (
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          <span>Загрузка файла на сервер...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">URL трейлера</label>
                    <input
                      type="url"
                      value={seriesForm.trailerUrl}
                      onChange={(e) => setSeriesForm({ ...seriesForm, trailerUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 mb-2">Сезонов</label>
                      <input
                        type="number"
                        value={seriesForm.totalSeasons || ''}
                        onChange={(e) => setSeriesForm({ ...seriesForm, totalSeasons: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 mb-2">Эпизодов</label>
                      <input
                        type="number"
                        value={seriesForm.totalEpisodes || ''}
                        onChange={(e) => setSeriesForm({ ...seriesForm, totalEpisodes: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-white/80">
                      <input
                        type="checkbox"
                        checked={seriesForm.isOngoing}
                        onChange={(e) => setSeriesForm({ ...seriesForm, isOngoing: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Продолжается
                    </label>
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Жанры (через запятую) *</label>
                    <input
                      type="text"
                      value={seriesForm.genres.join(', ')}
                      onChange={(e) => setSeriesForm({ ...seriesForm, genres: e.target.value.split(',').map(g => g.trim()) })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Драма, Комедия, Боевик"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Актеры (через запятую)</label>
                    <input
                      type="text"
                      value={seriesForm.actors.join(', ')}
                      onChange={(e) => setSeriesForm({ ...seriesForm, actors: e.target.value.split(',').map(a => a.trim()) })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Имя актера 1, Имя актера 2"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={showEditModal ? handleUpdateSeries : handleCreateSeries}
                    disabled={loading || !seriesForm.title || !seriesForm.genres.length}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                  >
                    <FiSave size={18} />
                    {showEditModal ? 'Сохранить' : 'Создать'}
                  </motion.button>
                </div>
              )}

              {/* Actor Form */}
              {activeTab === 'actors' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2">Имя *</label>
                    <input
                      type="text"
                      value={actorForm.name}
                      onChange={(e) => setActorForm({ ...actorForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Имя актера"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Дата рождения</label>
                    <input
                      type="date"
                      value={actorForm.dateOfBirth}
                      onChange={(e) => setActorForm({ ...actorForm, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Биография</label>
                    <textarea
                      value={actorForm.biography}
                      onChange={(e) => setActorForm({ ...actorForm, biography: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Биография актера"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={showEditModal ? handleUpdateActor : handleCreateActor}
                    disabled={loading || !actorForm.name}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                  >
                    <FiSave size={18} />
                    {showEditModal ? 'Сохранить' : 'Создать'}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminPanel;

