import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const SignIn = () => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn(username, password);
    
    if (result.success) {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-24 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent"></div>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-4xl mx-auto"
      >
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
          <div className="grid md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-between border-r border-white/10 bg-gradient-to-br from-black/80 via-gray-900/80 to-black/80 p-10">
              <div>
                <div className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center mb-8 bg-white/5">
                  <FiLock className="text-white text-2xl" />
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tight">
                  {t('welcome')}
                </h2>
                <p className="mt-4 text-white/60 leading-relaxed">
                  {t('signInTitle')}
                </p>
              </div>
              <div className="space-y-2 text-white/40 text-sm">
                <p className="uppercase tracking-widest text-white/30">Cinema</p>
                <div className="h-px w-16 bg-white/10"></div>
                <p>{t('manageProfile')}</p>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                  {t('signIn')}
                </h1>
                <p className="text-white/50 text-sm">
                  {t('signInSubtitle') || t('signInTitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-[0.2em] text-white/40">
                    {t('username')}
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-10 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0 transition-all"
                      placeholder={t('username')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-[0.2em] text-white/40">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-10 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0 transition-all"
                      placeholder={t('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/30">{t('secureLogin') || 'Secure login area'}</span>
                  <Link
                    to="/forgot-password"
                    className="text-white/60 hover:text-white transition-colors underline-offset-2 hover:underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !username || !password}
                  whileHover={{ scale: loading || !username || !password ? 1 : 1.02 }}
                  whileTap={{ scale: loading || !username || !password ? 1 : 0.98 }}
                  className="w-full rounded-xl bg-white text-black py-3.5 font-semibold tracking-wide transition-all duration-300 hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 text-sm">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-4 w-4 rounded-full border-2 border-black border-t-transparent"
                      />
                      {t('signingIn')}
                    </span>
                  ) : (
                    t('signIn')
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/50 text-sm">
                  {t('noAccount')}{' '}
                  <Link
                    to="/sign-up"
                    className="text-white hover:text-white/80 font-medium"
                  >
                    {t('createAccount')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignIn;

