import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useLanguageStore } from '../../stores/languageStore';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SignUp = () => {
  const { t } = useLanguageStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    const result = await signUp(formData);
    
    if (result.success) {
      navigate('/sign-in');
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
        <div className="absolute top-32 right-12 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
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
                  <FiUserPlus className="text-white text-2xl" />
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tight">
                  {t('signUp')}
                </h2>
                <p className="mt-4 text-white/60 leading-relaxed">
                  {t('signUpTitle')}
                </p>
              </div>
              <div className="space-y-2 text-white/40 text-sm">
                <p className="uppercase tracking-widest text-white/30">Cinema</p>
                <div className="h-px w-16 bg-white/10"></div>
                <p>{t('trustedUserBenefits')}</p>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                  {t('createAccount')}
                </h1>
                <p className="text-white/50 text-sm">
                  {t('signUpSubtitle') || t('signUpTitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-white/40">
                      {t('firstName')}
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0 transition-all"
                      placeholder={t('firstName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-[0.2em] text-white/40">
                      {t('lastName')}
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0"
                      placeholder={t('lastName')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-[0.2em] text-white/40">
                    {t('username')} *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-10 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0 transition-all"
                      placeholder={t('username')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-[0.2em] text-white/40">
                    {t('email')} *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-10 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0 transition-all"
                      placeholder={t('email')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-[0.2em] text-white/40">
                    {t('password')} *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
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

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-[0.2em] text-white/40">
                    {t('confirmPassword')} *
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-10 py-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none focus:ring-0 transition-all"
                      placeholder={t('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !formData.username || !formData.email || !formData.password || !formData.confirmPassword}
                  whileHover={{ scale: loading || !formData.username || !formData.email || !formData.password || !formData.confirmPassword ? 1 : 1.02 }}
                  whileTap={{ scale: loading || !formData.username || !formData.email || !formData.password || !formData.confirmPassword ? 1 : 0.98 }}
                  className="w-full rounded-xl bg-white text-black py-3.5 font-semibold tracking-wide transition-all duration-300 hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 text-sm">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-4 w-4 rounded-full border-2 border-black border-t-transparent"
                      />
                      {t('signingUp')}
                    </span>
                  ) : (
                    t('signUp')
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/50 text-sm">
                  {t('alreadyHaveAccount')}{' '}
                  <Link
                    to="/sign-in"
                    className="text-white hover:text-white/80 font-medium"
                  >
                    {t('signIn')}
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

export default SignUp;

