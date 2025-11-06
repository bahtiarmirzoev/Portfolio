import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiHeart, FiMessageSquare, FiStar, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import Favorites from './Favorites';
import Comments from './Comments';
import Ratings from './Ratings';

const Profile = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('favorites');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const tabs = [
    { id: 'favorites', label: t('favorites'), icon: FiHeart },
    { id: 'comments', label: t('myComments'), icon: FiMessageSquare },
    { id: 'ratings', label: t('myRatings'), icon: FiStar },
  ];

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
        {/* Header */}
        <motion.header
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass rounded-2xl p-6 mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-white hover:text-white/80 transition-colors"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <FiUser className="text-white text-xl" />
              </div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold text-white"
                >
                  {t('personalCabinet')}
                </motion.h1>
                <p className="text-white/60 text-sm">{t('manageProfile')}</p>
              </div>
            </motion.div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="btn-secondary flex items-center gap-2 hidden md:flex"
          >
            <FiLogOut /> {t('signOut')}
          </motion.button>
        </motion.header>

        <div className="flex gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`glass rounded-2xl p-6 h-fit sticky top-8 ${
              sidebarOpen ? 'fixed inset-4 z-50 md:relative md:inset-0' : 'hidden md:block'
            }`}
          >
            <div className="flex flex-col gap-2 min-w-[200px]">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500 ${
                      activeTab === tab.id
                        ? 'text-black font-semibold shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ x: 5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeProfileTab"
                        className="absolute inset-0 bg-white rounded-lg"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon size={20} className="relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </motion.button>
                );
              })}
              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 mt-4 md:hidden"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiLogOut size={20} />
                <span>{t('signOut')}</span>
              </motion.button>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'favorites' && (
                <motion.div
                  key="favorites"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
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
                >
                  <Ratings />
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

