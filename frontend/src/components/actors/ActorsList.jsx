import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { actorsService } from '../../services/actorsService';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiUser, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ActorsList = () => {
  const { t } = useLanguage();
  const [actors, setActors] = useState([]);
  const [filteredActors, setFilteredActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadActors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = actors.filter(actor =>
        actor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActors(filtered);
    } else {
      setFilteredActors(actors);
    }
  }, [searchQuery, actors]);

  const loadActors = async () => {
    try {
      setLoading(true);
      const data = await actorsService.getAll();
      setActors(data);
      setFilteredActors(data);
    } catch (error) {
      toast.error(t('errorLoadingActors'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
          className="glass rounded-2xl p-6 mb-8"
        >
            <div className="mb-6">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold text-white mb-2"
              >
                {t('actors')}
              </motion.h1>
              <p className="text-white/60">{t('actorsCatalog')}</p>
            </div>

            {/* Search */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
                placeholder={t('searchActors')}
              />
            </motion.div>
        </motion.header>

        {/* Actors Grid */}
        {loading ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
            <p className="text-white/60 mt-4">Загрузка актеров...</p>
          </div>
        ) : filteredActors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <FiUser className="mx-auto text-6xl text-white/20 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{t('notFound')}</h2>
            <p className="text-white/60">{t('tryDifferentSearch')}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredActors.map((actor, index) => (
              <motion.div
                key={actor.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="card group text-center cursor-pointer"
              >
                <Link to={`/actors/${actor.id}`} className="block">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors border-2 border-white/20 group-hover:border-white/40">
                    <FiUser className="text-white text-4xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-white/80 transition-colors line-clamp-2">
                    {actor.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActorsList;

