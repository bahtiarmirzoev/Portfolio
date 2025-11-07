import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { actorsService } from '../../services/actorsService';
import { moviesService } from '../../services/moviesService';
import { seriesService } from '../../services/seriesService';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiUser, FiArrowLeft, FiFilm, FiTv, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ActorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [actor, setActor] = useState(null);
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' or 'series'

  useEffect(() => {
    loadActorData();
  }, [id]);

  const loadActorData = async () => {
    try {
      setLoading(true);
      
      // Загружаем актера
      const actors = await actorsService.getAll();
      const foundActor = actors.find(a => a.id === id);
      
      if (!foundActor) {
        toast.error('Актер не найден');
        navigate('/actors');
        return;
      }
      
      setActor(foundActor);
      
      // Загружаем фильмы с этим актером
      try {
        const moviesResponse = await moviesService.getAll({ actor: foundActor.name, take: 50 });
        const moviesData = moviesResponse?.items || moviesResponse || [];
        setMovies(moviesData.filter(movie => 
          movie.actors?.some(a => a.id === id || a.name === foundActor.name)
        ));
      } catch (error) {
        console.error('Error loading movies:', error);
        setMovies([]);
      }
      
      // Загружаем сериалы с этим актером
      try {
        const seriesResponse = await seriesService.getAll({ actor: foundActor.name, take: 50 });
        const seriesData = seriesResponse?.items || seriesResponse || [];
        setSeries(seriesData.filter(s => 
          s.actors?.some(a => a.id === id || a.name === foundActor.name)
        ));
      } catch (error) {
        console.error('Error loading series:', error);
        setSeries([]);
      }
    } catch (error) {
      toast.error('Ошибка при загрузке данных актера');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!actor) {
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

        {/* Actor Info */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center border-2 border-white/20">
                <FiUser className="text-white/40 text-8xl" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                {actor.name}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 justify-center md:justify-start mb-6 text-white/60"
              >
                <span className="text-lg">
                  {t('moviesCount')}: <span className="text-white font-semibold">{movies.length}</span>
                </span>
                <span className="text-lg">
                  {t('seriesCount')}: <span className="text-white font-semibold">{series.length}</span>
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('movies')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === 'movies'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiFilm /> {t('actorMovies')} ({movies.length})
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('series')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === 'series'
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiTv /> {t('actorSeries')} ({series.length})
              </div>
            </motion.button>
          </div>

          {/* Content */}
          {activeTab === 'movies' ? (
            <div>
              {movies.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FiFilm className="mx-auto text-6xl text-white/20 mb-4" />
                  <p className="text-white/60 text-lg">{t('noActorMovies')}</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movies.map((movie, index) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5, scale: 1.05 }}
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
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className="text-white font-semibold text-sm line-clamp-2">
                                  {movie.title}
                                </h3>
                                {movie.averageRating && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <FiStar className="text-yellow-400 fill-yellow-400" size={12} />
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
                        {movie.year && (
                          <p className="text-white/40 text-xs mt-1">{movie.year}</p>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {series.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FiTv className="mx-auto text-6xl text-white/20 mb-4" />
                  <p className="text-white/60 text-lg">{t('noActorSeries')}</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {series.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5, scale: 1.05 }}
                      className="group cursor-pointer"
                    >
                      <Link to={`/series/${item.id}`}>
                        {item.posterUrl ? (
                          <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3]">
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {item.isOngoing && (
                              <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/90 text-white text-xs font-semibold rounded">
                                Идёт
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className="text-white font-semibold text-sm line-clamp-2">
                                  {item.title}
                                </h3>
                                {item.averageRating && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <FiStar className="text-yellow-400 fill-yellow-400" size={12} />
                                    <span className="text-white text-xs">{item.averageRating.toFixed(1)}</span>
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
                          {item.title}
                        </h3>
                        {item.yearOfRelease && (
                          <p className="text-white/40 text-xs mt-1">{item.yearOfRelease}</p>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ActorDetail;

