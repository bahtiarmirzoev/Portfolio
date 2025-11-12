import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useLanguageStore } from '../../stores/languageStore';
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
  FiShield,
  FiMoreHorizontal,
  FiSettings
} from 'react-icons/fi';

const Header = () => {
  const { isAuthenticated, signOut, isTrusted, isAdmin } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
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

  const ctaLinks = [
    { label: t('movies'), to: '/movies', description: t('catalog') },
    { label: t('series'), to: '/series', description: t('ongoingSeries') || t('series') },
    { label: t('actors'), to: '/actors', description: t('actorsCatalog') || t('actors') },
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
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_10px_60px_rgba(0,0,0,0.4)]"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-white/80 via-white to-white/70 text-black shadow-[0_0_40px_rgba(255,255,255,0.35)]"
            >
              <FiFilm size={22} />
            </motion.div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-lg font-semibold text-white/80">Cinema</span>
              <span className="text-xs text-white/40">Unlimited stories</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <motion.div key={link.to} whileHover={{ translateY: -3 }}>
                  <Link
                    to={link.to}
                    className={`relative flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.25)]'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={17} />
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="relative" ref={languageMenuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80"
              >
                <FiGlobe size={16} />
                <span>{languages.find((l) => l.code === language)?.flag}</span>
                <motion.span animate={{ rotate: languageMenuOpen ? 180 : 0 }}>
                  <FiChevronDown size={12} />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {languageMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-2 backdrop-blur-2xl"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLanguageMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all ${
                          language === lang.code
                            ? 'bg-white text-black shadow-lg'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100"
                  >
                    <FiShield size={15} />
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="relative flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/30 hover:text-white"
                >
                  <FiUser size={16} />
                  {t('profile')}
                  {isTrusted && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-black bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] text-white"
                    >
                      <FiCheck />
                    </motion.span>
                  )}
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg hover:bg-white/90"
                >
                  <FiLogOut size={16} />
                  {t('signOut')}
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/sign-in"
                  className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/30 hover:text-white"
                >
                  <FiLogIn size={16} />
                  {t('signInShort')}
                </Link>
                <Link
                  to="/sign-up"
                  className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg hover:bg-white/90"
                >
                  <FiUserPlus size={16} />
                  {t('signUpShort')}
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2 text-white transition-colors hover:border-white/30 hover:text-white lg:hidden"
          >
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 bg-black/60 backdrop-blur-2xl lg:hidden"
          >
            <div className="space-y-4 px-4 py-5">
              <div className="flex flex-col gap-2">
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
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                          isActive(link.to)
                            ? 'bg-white text-black font-semibold'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon size={18} />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 rounded-2xl px-4 py-3 text-sm transition-all ${
                      language === lang.code
                        ? 'bg-white text-black font-semibold'
                        : 'border border-white/15 bg-white/5 text-white/70 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <FiUser size={18} />
                      {t('profile')}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <FiLogOut size={18} />
                      {t('signOut')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80"
                    >
                      <FiLogIn size={18} />
                      {t('signInShort')}
                    </Link>
                    <Link
                      to="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-black"
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

