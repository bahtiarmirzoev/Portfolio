import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiKey } from 'react-icons/fi';

const ResetPassword = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    otpCode: '',
    newPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;
    if (e.target.name === 'otpCode') {
      // Ограничиваем OTP код до 6 цифр
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData({
        ...formData,
        [e.target.name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await resetPassword(
      formData.email,
      formData.otpCode,
      formData.newPassword
    );
    
    if (result.success) {
      navigate('/sign-in');
    }
    
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass rounded-2xl p-8 shadow-2xl"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <FiKey className="mx-auto text-5xl text-white mb-4" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-2">{t('resetPassword')}</h1>
            <p className="text-white/70">{t('enterOtpAndPassword')}</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-white/80 text-sm font-medium mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                </motion.div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder={t('email')}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-white/80 text-sm font-medium mb-2">
                {t('otpCode')}
              </label>
              <motion.input
                type="text"
                name="otpCode"
                value={formData.otpCode}
                onChange={handleChange}
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="input-field text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-white/80 text-sm font-medium mb-2">
                {t('newPassword')}
              </label>
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                </motion.div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="input-field pl-10 pr-10"
                  placeholder={t('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="rounded-full h-5 w-5 border-t-2 border-b-2 border-white"
                  />
                  {t('resetPassword')}...
                </span>
              ) : (
                t('resetPassword')
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center"
          >
            <Link
              to="/sign-in"
                className="text-white hover:text-white/80 text-sm transition-colors duration-300 inline-flex items-center gap-2"
            >
              <FiArrowLeft /> {t('backToSignIn')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResetPassword;

