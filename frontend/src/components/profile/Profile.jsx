import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiHeart, FiMessageSquare, FiStar, FiLogOut, FiMenu, FiX, FiShield, FiCheck, FiArrowRight } from 'react-icons/fi';
import Favorites from './Favorites';
import Comments from './Comments';
import Ratings from './Ratings';
import TrustedUser from './TrustedUser';

const Profile = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('favorites');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, isTrusted } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const tabs = [
    { id: 'favorites', label: t('favorites'), icon: FiHeart },
    { id: 'comments', label: t('myComments'), icon: FiMessageSquare },
    { id: 'ratings', label: t('myRatings'), icon: FiStar },
    { id: 'trusted', label: t('trustedUser'), icon: FiShield },
  ];

  const tabDescriptions = {
    favorites: t('favorites'),
    comments: t('myComments'),
    ratings: t('myRatings'),
    trusted: t('trustedUserBenefits') || t('trustedUser'),
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.4 }
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
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_0_80px_rgba(255,255,255,0.05)] backdrop-blur-3xl md:px-10 md:py-12"
        >
          <motion.span
            className="pointer-events-none absolute -right-20 top-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent blur-[120px]"
            animate={{ x: [0, 16, 0], y: [0, -12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="pointer-events-none absolute -left-14 bottom-[-20%] h-72 w-72 rounded-full bg-gradient-to-tl from-white/15 via-transparent to-transparent blur-[120px]"
            animate={{ x: [0, -14, 0], y: [0, 10, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="rounded-2xl border border-white/15 bg-white/10 p-2 text-white transition-colors hover:border-white/30 hover:text-white md:hidden"
                >
                  {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                </button>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-br from-white/15 via-transparent to-white/5 text-2xl text-white shadow-[0_0_30px_rgba(255,255,255,0.12)]">
                    <FiUser />
                  </div>
                  <div className="space-y-2">
                    <motion.h1
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 text-3xl font-semibold text-white sm:text-4xl"
                    >
                      {t('personalCabinet')}
                      {isTrusted && (
                        <motion.span
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-gradient-to-br from-blue-500 to-purple-600 text-xs text-white shadow-lg"
                          title={t('trustedUser')}
                        >
                          <FiCheck />
                        </motion.span>
                      )}
                    </motion.h1>
                    <p className="text-sm text-white/60">{t('manageProfile')}</p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-black shadow-lg hover:bg-white/90"
              >
                <FiLogOut /> {t('signOut')}
              </motion.button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ translateY: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative overflow-hidden rounded-2xl border border-white/10 px-5 py-5 text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-black shadow-[0_0_60px_rgba(255,255,255,0.25)]'
                        : 'bg-black/40 text-white/80 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <motion.span
                      className="pointer-events-none absolute -right-10 -top-12 h-20 w-20 rounded-full bg-white/10"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 16 + index * 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="relative z-10 flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                          activeTab === tab.id ? 'border-black/30 bg-black/10 text-black' : 'border-white/20 bg-white/10 text-white'
                        }`}
                      >
                        <Icon />
                      </span>
                      <div>
                        <p className={`text-sm font-semibold ${activeTab === tab.id ? 'text-black' : 'text-white'}`}>
                          {tab.label}
                        </p>
                        <p className={`text-xs ${activeTab === tab.id ? 'text-black/70' : 'text-white/50'}`}> {tabDescriptions[tab.id]}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.section>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}

        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <motion.aside
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: sidebarOpen ? 0 : 0, opacity: sidebarOpen ? 1 : 1 }}
            className={`${
              sidebarOpen ? 'fixed inset-4 z-50 md:static md:block' : 'hidden md:block'
            } lg:sticky lg:top-24`}
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
              {sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-2 text-white hover:border-white/40 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              )}
              <div className="flex flex-col gap-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.08, duration: 0.5 }}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? 'border-white/60 bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.25)]'
                          : 'border-white/10 bg-black/40 text-white/70 hover:border-white/30 hover:text-white'
                      }`}
                      whileHover={{ x: 5, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={isActive ? 'text-black' : 'text-white/80'} size={18} />
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isActive ? 'text-black' : 'text-white'}`}>
                          {tab.label}
                        </p>
                        <p className={`text-xs ${isActive ? 'text-black/60' : 'text-white/45'}`}>
                          {tabDescriptions[tab.id]}
                        </p>
                      </div>
                      <FiArrowRight
                        className={`text-xs ${isActive ? 'text-black/40' : 'text-white/30'}`}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'favorites' && (
                <motion.div
                  key="favorites"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl"
                >
                  <Favorites />
                </motion.div>
              )}
              {activeTab === 'comments' && (
                <motion.div
                  key="comments"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl"
                >
                  <Comments />
                </motion.div>
              )}
              {activeTab === 'ratings' && (
                <motion.div
                  key="ratings"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl"
                >
                  <Ratings />
                </motion.div>
              )}
              {activeTab === 'trusted' && (
                <motion.div
                  key="trusted"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl"
                >
                  <TrustedUser />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;

