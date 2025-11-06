import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  FiFilm, 
  FiTv, 
  FiUser, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiGlobe,
  FiChevronDown,
  FiLogIn,
  FiUserPlus,
  FiCheck,
  FiShield
} from 'react-icons/fi';

const Header = () => {
  const { isAuthenticated, signOut, isTrusted, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef(null);

  // Закрытие меню языков при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    };

    if (languageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [languageMenuOpen]);

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/movies', label: t('movies'), icon: FiFilm },
    { to: '/series', label: t('series'), icon: FiTv },
    { to: '/actors', label: t('actors'), icon: FiUser },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="sticky top-0 z-50 glass-strong border-b border-white/20 backdrop-blur-2xl shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="w-12 h-12 bg-gradient-to-br from-white to-white/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow"
            >
              <FiFilm className="text-black text-2xl" />
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent hidden sm:block group-hover:from-white group-hover:to-white transition-all"
            >
              Cinema
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <motion.div
                  key={link.to}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.to}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                      active
                        ? 'bg-white text-black shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white rounded-xl"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon 
                      size={18} 
                      className={`relative z-10 ${active ? 'text-black' : ''}`}
                    />
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Language Selector */}
          <div className="hidden md:block relative" ref={languageMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5"
            >
              <motion.div
                animate={{ rotate: languageMenuOpen ? 360 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiGlobe size={18} />
              </motion.div>
              <span className="text-lg">{languages.find(l => l.code === language)?.flag}</span>
              <motion.div
                animate={{ rotate: languageMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiChevronDown size={14} />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {languageMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute top-full right-0 mt-2 glass rounded-xl p-2 min-w-[150px] shadow-2xl z-50"
                >
                  {languages.map((lang) => (
                    <motion.button
                      key={lang.code}
                      whileHover={{ x: 5 }}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLanguageMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        language === lang.code
                          ? 'bg-white text-black font-semibold'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/admin"
                      className="btn-secondary flex items-center gap-2 px-5 py-2.5 relative bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30"
                    >
                      <FiShield size={18} />
                      <span>Админ</span>
                    </Link>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/profile"
                    className="btn-secondary flex items-center gap-2 px-5 py-2.5 relative"
                  >
                    <FiUser size={18} />
                    <span>{t('profile')}</span>
                    {isTrusted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-black shadow-lg"
                      >
                        <FiCheck className="text-white text-xs" />
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="btn-secondary flex items-center gap-2 px-5 py-2.5"
                >
                  <FiLogOut size={18} /> {t('signOut')}
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/sign-in" 
                    className="btn-secondary flex items-center gap-2 px-4 py-2.5 min-w-[100px] justify-center"
                  >
                    <FiLogIn size={18} />
                    <span>{t('signInShort')}</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/sign-up" 
                    className="btn-primary flex items-center gap-2 px-4 py-2.5 min-w-[100px] justify-center"
                  >
                    <FiUserPlus size={18} />
                    <span>{t('signUpShort')}</span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation */}
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(link.to)
                          ? 'bg-white text-black font-semibold'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={20} />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Mobile Language Selector */}
              <div className="pt-4 border-t border-white/10">
                <div className="px-4 py-2 mb-2">
                  <p className="text-white/60 text-sm mb-2 flex items-center gap-2">
                    <FiGlobe size={16} />
                    {t('catalog')}
                  </p>
                  <div className="flex gap-2">
                    {languages.map((lang) => (
                      <motion.button
                        key={lang.code}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setLanguage(lang.code);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          language === lang.code
                            ? 'bg-white text-black font-semibold'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <motion.span
                          animate={language === lang.code ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="text-lg"
                        >
                          {lang.flag}
                        </motion.span>
                        <span className="text-sm">{lang.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30"
                      >
                        <FiShield size={20} />
                        <span>Админ</span>
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all relative"
                    >
                      <FiUser size={20} />
                      <span>{t('profile')}</span>
                      {isTrusted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-black shadow-lg"
                        >
                          <FiCheck className="text-white text-xs" />
                        </motion.div>
                      )}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <FiLogOut size={20} />
                      {t('signOut')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full text-center btn-secondary"
                    >
                      <FiLogIn size={18} />
                      {t('signInShort')}
                    </Link>
                    <Link
                      to="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full text-center btn-primary"
                    >
                      <FiUserPlus size={18} />
                      {t('signUpShort')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;

