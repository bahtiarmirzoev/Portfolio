import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { actorsService } from '../../services/actorsService';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiArrowLeft, FiCalendar, FiFilm, FiTv, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ActorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActor = async () => {
      try {
        setLoading(true);
        const data = await actorsService.getById(id);
        setActor(data);
      } catch (error) {
        console.error(error);
        toast.error(t('errorLoadingActorDetails') || 'Не удалось загрузить данные актера');
        navigate('/actors');
      } finally {
        setLoading(false);
      }
    };

    fetchActor();
  }, [id, navigate, t]);

  const formatDate = (dateString) => {
    if (!dateString) return null;

    try {
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(dateString));
    } catch (error) {
      return dateString;
    }
  };

  const renderWorks = (items, type) => {
    if (!items || items.length === 0) {
      return <p className="text-sm text-white/40">{type === 'movies' ? 'Фильмы не найдены.' : 'Сериалы не найдены.'}</p>;
    }

    return (
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/${type === 'movies' ? 'movies' : 'series'}/${item.id}`}
            className="group rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            <div className="font-semibold">{item.title}</div>
            <div className="text-xs text-white/40">
              {type === 'movies'
                ? item.year ?? item.yearOfRelease ?? ''
                : `${item.yearOfRelease}${item.yearOfEnd ? ` — ${item.yearOfEnd}` : item.isOngoing ? ' — ...' : ''}`}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
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
      transition={{ duration: 0.6 }}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-950 to-black p-4 md:p-10"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-16 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-24 right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            <FiArrowLeft /> {t('back')}
          </motion.button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-2xl">
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="flex-shrink-0">
              <div className="flex h-48 w-48 items-center justify-center rounded-3xl border border-white/10 bg-black/40 text-6xl text-white/30">
                {actor.name
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part.charAt(0))
                  .join('')
                  .toUpperCase()}
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold text-white tracking-tight lg:text-5xl">
                  {actor.name}
                </h1>
                {actor.dateOfBirth && (
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <FiCalendar />
                    <span>{formatDate(actor.dateOfBirth)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/40">
                  <FiBookOpen className="text-base" />
                  Биография
                </div>
                <p className="text-white/70 leading-relaxed">
                  {actor.biography || 'Биография пока отсутствует.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/40">
              <FiFilm className="text-base" />
              Фильмы
            </div>
            {renderWorks(actor.movies, 'movies')}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/40">
              <FiTv className="text-base" />
              Сериалы
            </div>
            {renderWorks(actor.series, 'series')}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/40 backdrop-blur-xl">
          <p>
            {t('tipExploreActor') ||
              'Совет: откройте любой проект актера, чтобы посмотреть рейтинги, трейлеры и отзывы зрителей.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ActorDetail;

