import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      await authService.checkAuth();
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username, password) => {
    try {
      const tokenData = await authService.signIn(username, password);
      localStorage.setItem('accessToken', tokenData.accessToken);
      localStorage.setItem('refreshToken', tokenData.refreshToken);
      setIsAuthenticated(true);
      toast.success('Вход выполнен успешно!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data || 'Неверное имя пользователя или пароль';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signUp = async (data) => {
    try {
      await authService.signUp(data);
      toast.success('Регистрация прошла успешно! Теперь вы можете войти.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data || 'Ошибка при регистрации';
      const details = error.response?.data?.details || [];
      if (details.length > 0) {
        details.forEach(detail => toast.error(detail));
      } else {
        toast.error(message);
      }
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      toast.success('Вы вышли из системы');
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      toast.success('Если email существует, код OTP был отправлен.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при отправке кода';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email, otpCode, newPassword) => {
    try {
      await authService.resetPassword(email, otpCode, newPassword);
      toast.success('Пароль успешно изменен!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при сбросе пароля';
      const details = error.response?.data?.details || [];
      if (details.length > 0) {
        details.forEach(detail => toast.error(detail));
      } else {
        toast.error(message);
      }
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

