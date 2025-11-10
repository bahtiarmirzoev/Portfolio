import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiHeart, FiMessageSquare, FiStar, FiLogOut, FiMenu, FiX, FiShield, FiCheck, FiArrowRight, FiSettings, FiGrid, FiList } from 'react-icons/fi';
import Favorites from './Favorites';
import Comments from './Comments';
import Ratings from './Ratings';
import TrustedUser from './TrustedUser';
import Settings from './Settings';

const Profile = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('favorites');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, isTrusted, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const tabs = [
    { id: 'favorites', label: t('favorites'), icon: FiHeart, color: 'from-red-500/20 to-pink-500/20', borderColor: 'border-red-500/30' },
    { id: 'comments', label: t('myComments'), icon: FiMessageSquare, color: 'from-blue-500/20 to-cyan-500/20', borderColor: 'border-blue-500/30' },
    { id: 'ratings', label: t('myRatings'), icon: FiStar, color: 'from-yellow-500/20 to-orange-500/20', borderColor: 'border-yellow-500/30' },
    { id: 'trusted', label: t('trustedUser'), icon: FiShield, color: 'from-purple-500/20 to-indigo-500/20', borderColor: 'border-purple-500/30' },
    { id: 'settings', label: t('settings') || 'Settings', icon: FiSettings, color: 'from-gray-500/20 to-slate-500/20', borderColor: 'border-gray-500/30' },
  ];

  const tabVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative min-h-screen p-4 md:p-6 lg:p-8"
      >
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-2xl shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
            <div className="relative p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden rounded-2xl border border-white/20 bg-white/10 p-3 text-white transition-all hover:bg-white/20 hover:scale-105"
                  >
                    {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                  </button>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-purple-500/50 rounded-3xl blur-xl opacity-50" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-white/30 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl shadow-2xl">
                      <FiUser className="text-3xl text-white" />
                    </div>
                    {isTrusted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                      >
                        <FiCheck className="text-white text-xs" />
                      </motion.div>
                    )}
                  </motion.div>

                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3"
                      >
                        {t('personalCabinet')}
                      </motion.h1>
                      <p className="text-white/60 text-sm md:text-base">
                        {user?.username ? `@${user.username}` : user?.email || t('manageProfile')}
                      </p>
                    </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-white/10 to-white/5 px-6 py-3 text-white backdrop-blur-xl transition-all hover:from-white hover:to-white/90 hover:text-black hover:shadow-xl"
                >
                  <span className="relative z-10 flex items-center gap-2 font-semibold">
                    <FiLogOut /> {t('signOut')}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar Navigation */}
            <motion.aside
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={`${
                sidebarOpen ? 'fixed inset-4 z-50 lg:static lg:inset-0' : 'hidden lg:block'
              }`}
            >
              {sidebarOpen && (
                <div
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1] lg:hidden"
                />
              )}
              
              <div className="relative h-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-2xl p-4 shadow-2xl">
                {sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute right-4 top-4 rounded-xl border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20 lg:hidden"
                  >
                    <FiX size={18} />
                  </button>
                )}
                
                <div className="space-y-2">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSidebarOpen(false);
                        }}
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`group relative w-full flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                          isActive
                            ? `border-white/40 bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-${tab.borderColor.split('/')[0]}/20`
                            : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white to-white/50 rounded-r-full"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                          isActive 
                            ? 'bg-white/20 text-white shadow-lg' 
                            : 'bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>
                            {tab.label}
                          </p>
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          >
                            <FiArrowRight className="text-white/60" size={16} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.aside>

            {/* Main Content */}
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
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
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-2xl p-6 md:p-8 shadow-2xl"
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
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-2xl p-6 md:p-8 shadow-2xl"
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
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-2xl p-6 md:p-8 shadow-2xl"
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
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-2xl p-6 md:p-8 shadow-2xl"
                  >
                    <TrustedUser />
                  </motion.div>
                )}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-2xl p-6 md:p-8 shadow-2xl"
                  >
                    <Settings />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.main>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
