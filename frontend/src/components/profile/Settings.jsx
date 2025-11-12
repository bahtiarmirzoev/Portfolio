import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useLanguageStore } from '../../stores/languageStore';
import { FiSettings, FiGlobe, FiLock, FiUser, FiMail, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

const Settings = () => {
  const { t, language, setLanguage } = useLanguageStore();
  const { user, changePassword, loadUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  
  // Language settings
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  ];

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  useEffect(() => {
    const loadUserData = async () => {
      setUserLoading(true);
      await loadUser();
      setUserLoading(false);
    };
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    setLanguage(langCode);
    toast.success(t('languageChanged') || 'Language changed');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error(t('fillAllFields') || 'Please fill all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error(t('passwordTooShort') || 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      toast.error(t('passwordChangeError') || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'general', label: t('generalSettings') || 'General', icon: FiSettings },
    { id: 'language', label: t('language') || 'Language', icon: FiGlobe },
    { id: 'security', label: t('security') || 'Security', icon: FiLock },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl"
      >
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          >
            <FiSettings className="text-white" />
          </motion.div>
          {t('settings') || 'Settings'}
        </h2>
        <p className="text-white/60">{t('manageAccountSettings') || 'Manage your account settings and preferences'}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.id}
                whileHover={{ x: 5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                  activeSection === section.id
                    ? 'border-white/60 bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.25)]'
                    : 'border-white/10 bg-black/40 text-white/70 hover:border-white/30 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-semibold">{section.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl"
        >
          {activeSection === 'general' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">{t('generalSettings') || 'General Settings'}</h3>
              
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                      <FiUser className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{t('accountInformation') || 'Account Information'}</p>
                      <p className="text-white/60 text-sm">{t('viewAccountDetails') || 'View your account details'}</p>
                    </div>
                  </div>
                  {userLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between py-2 border-b border-white/10">
                        <span className="text-white/60 text-sm">{t('username') || 'Username'}:</span>
                        <span className="text-white font-semibold">{user?.username || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-white/10">
                        <span className="text-white/60 text-sm">{t('email') || 'Email'}:</span>
                        <span className="text-white font-semibold">{user?.email || 'N/A'}</span>
                      </div>
                      {user?.firstName && (
                        <div className="flex items-center justify-between py-2 border-b border-white/10">
                          <span className="text-white/60 text-sm">{t('firstName') || 'First Name'}:</span>
                          <span className="text-white font-semibold">{user.firstName}</span>
                        </div>
                      )}
                      {user?.lastName && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-white/60 text-sm">{t('lastName') || 'Last Name'}:</span>
                          <span className="text-white font-semibold">{user.lastName}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'language' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">{t('languageSettings') || 'Language Settings'}</h3>
              
              <div className="space-y-4">
                <p className="text-white/60">{t('selectLanguage') || 'Select your preferred language'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {languages.map((lang) => (
                    <motion.button
                      key={lang.code}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all ${
                        selectedLanguage === lang.code
                          ? 'border-white/60 bg-white text-black shadow-[0_0_35px_rgba(255,255,255,0.25)]'
                          : 'border-white/10 bg-black/40 text-white hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{lang.flag}</span>
                        <div>
                          <p className="font-semibold">{lang.name}</p>
                          {selectedLanguage === lang.code && (
                            <p className="text-xs opacity-70 mt-1">{t('current') || 'Current'}</p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">{t('securitySettings') || 'Security Settings'}</h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                      <FiLock className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{t('changePassword') || 'Change Password'}</p>
                      <p className="text-white/60 text-sm">{t('updatePasswordInfo') || 'To change your password, please use the password reset feature'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        {t('currentPassword') || 'Current Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="input-field pr-10"
                          placeholder={t('enterCurrentPassword') || 'Enter current password'}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        >
                          {showPasswords.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        {t('newPassword') || 'New Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="input-field pr-10"
                          placeholder={t('enterNewPassword') || 'Enter new password'}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        >
                          {showPasswords.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        {t('confirmPassword') || 'Confirm Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="input-field pr-10"
                          placeholder={t('confirmNewPassword') || 'Confirm new password'}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        >
                          {showPasswords.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FiSave /> {t('saveChanges') || 'Save Changes'}
                    </motion.button>

                  </div>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;

