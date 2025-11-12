import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useLanguageStore } from '../../stores/languageStore';
import { otpService } from '../../services/otpService';
import { authService } from '../../services/authService';
import { decodeJWT } from '../../utils/jwt';
import { FiCheck, FiMail, FiKey, FiShield, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TrustedUser = () => {
  const { t } = useLanguageStore();
  const { isTrusted, refreshUserRoles } = useAuthStore();
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [userId, setUserId] = useState(null);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    const decoded = decodeJWT(token);
    return decoded?.userId || decoded?.sub || null;
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast.error(t('enterEmail'));
      return;
    }

    try {
      setLoading(true);
      const id = getUserIdFromToken();
      if (!id) {
        toast.error(t('errorGettingUserId'));
        return;
      }

      setUserId(id);
      await otpService.sendOtp(id, email);
      setStep('verify');
      toast.success(t('otpSent'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('errorSendingOtp'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast.error(t('enterValidOtp'));
      return;
    }

    try {
      setLoading(true);
      await otpService.verifyOtp(userId, otpCode);
      toast.success(t('trustedUserUpgraded'));
      
      // Обновляем роли после получения trusted_user статуса
      // Обновляем токен через refresh, чтобы получить новую роль
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
          const tokenData = await authService.refreshToken(accessToken, refreshToken);
          localStorage.setItem('accessToken', tokenData.accessToken);
          localStorage.setItem('refreshToken', tokenData.refreshToken);
          
          // Обновляем роли
          refreshUserRoles();
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        // Если не удалось обновить токен, перезагружаем страницу
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
      setStep('request');
      setOtpCode('');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || t('errorVerifyingOtp'));
    } finally {
      setLoading(false);
    }
  };

  if (isTrusted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-8 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <FiShield className="text-white text-4xl" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <FiCheck className="text-green-400 text-2xl" />
          <h2 className="text-3xl font-bold text-white">{t('trustedUser')}</h2>
        </motion.div>
        <p className="text-white/70 text-lg">{t('trustedUserDescription')}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FiShield className="text-white text-3xl" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{t('becomeTrustedUser')}</h2>
          <p className="text-white/60">{t('trustedUserBenefits')}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'request' ? (
          <motion.div
            key="request"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder={t('email')}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendOtp}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  {t('sending')}...
                </>
              ) : (
                <>
                  <FiKey /> {t('sendOtp')}
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/70">{t('otpSentToEmail')}</p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setStep('request');
                  setOtpCode('');
                }}
                className="text-white/60 hover:text-white"
              >
                <FiX size={20} />
              </motion.button>
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                {t('otpCode')}
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(value);
                }}
                className="input-field text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerifyOtp}
              disabled={loading || otpCode.length !== 6}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  {t('verifying')}...
                </>
              ) : (
                <>
                  <FiCheck /> {t('verifyOtp')}
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TrustedUser;

