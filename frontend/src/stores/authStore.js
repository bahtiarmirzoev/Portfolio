import { create } from 'zustand';
import { authService } from '../services/authService';
import { getRolesFromToken, isTrustedUser, isAdmin as checkIsAdmin } from '../utils/jwt';
import toast from 'react-hot-toast';

export const useAuthStore = create((set, get) => {
  // Инициализация при загрузке store
  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        set({ loading: false });
        return;
      }

      await authService.checkAuth();
      set({ isAuthenticated: true });
      
      const updateUserRoles = (token) => {
        if (!token) {
          set({ isTrusted: false, isAdmin: false, userRoles: [] });
          return;
        }
        
        const roles = getRolesFromToken(token);
        set({
          userRoles: roles,
          isTrusted: isTrustedUser(token),
          isAdmin: checkIsAdmin(token),
        });
      };

      updateUserRoles(accessToken);
      
      // Загружаем данные пользователя
      try {
        const userData = await authService.getCurrentUser();
        set({ user: userData });
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({
        isAuthenticated: false,
        isTrusted: false,
        isAdmin: false,
        userRoles: [],
        user: null,
      });
    } finally {
      set({ loading: false });
    }
  };

  // Вызываем проверку аутентификации при инициализации (асинхронно, чтобы не блокировать)
  if (typeof window !== 'undefined') {
    checkAuth();
  }

  return {
    user: null,
    loading: true,
    isAuthenticated: false,
    isTrusted: false,
    isAdmin: false,
    userRoles: [],

    updateUserRoles: (token) => {
      if (!token) {
        set({ isTrusted: false, isAdmin: false, userRoles: [] });
        return;
      }
      
      const roles = getRolesFromToken(token);
      set({
        userRoles: roles,
        isTrusted: isTrustedUser(token),
        isAdmin: checkIsAdmin(token),
      });
    },

    checkAuth,

    signIn: async (username, password) => {
      try {
        const tokenData = await authService.signIn(username, password);
        localStorage.setItem('accessToken', tokenData.accessToken);
        localStorage.setItem('refreshToken', tokenData.refreshToken);
        set({ isAuthenticated: true });
        
        const updateUserRoles = (token) => {
          if (!token) {
            set({ isTrusted: false, isAdmin: false, userRoles: [] });
            return;
          }
          
          const roles = getRolesFromToken(token);
          set({
            userRoles: roles,
            isTrusted: isTrustedUser(token),
            isAdmin: checkIsAdmin(token),
          });
        };

        updateUserRoles(tokenData.accessToken);
        
        // Загружаем данные пользователя
        try {
          const userData = await authService.getCurrentUser();
          set({ user: userData });
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
        
        toast.success('Вход выполнен успешно!');
        return { success: true };
      } catch (error) {
        const message = error.response?.data?.error || error.response?.data || 'Неверное имя пользователя или пароль';
        toast.error(message);
        return { success: false, error: message };
      }
    },

    signUp: async (data) => {
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
    },

    signOut: async () => {
      try {
        await authService.signOut();
      } catch (error) {
        console.error('Sign out error:', error);
      } finally {
        set({
          isAuthenticated: false,
          user: null,
          isTrusted: false,
          isAdmin: false,
          userRoles: [],
        });
        toast.success('Вы вышли из системы');
      }
    },

    refreshUserRoles: () => {
      const accessToken = localStorage.getItem('accessToken');
      const updateUserRoles = (token) => {
        if (!token) {
          set({ isTrusted: false, isAdmin: false, userRoles: [] });
          return;
        }
        
        const roles = getRolesFromToken(token);
        set({
          userRoles: roles,
          isTrusted: isTrustedUser(token),
          isAdmin: checkIsAdmin(token),
        });
      };
      updateUserRoles(accessToken);
    },

    forgotPassword: async (email) => {
      try {
        await authService.forgotPassword(email);
        toast.success('Если email существует, код OTP был отправлен.');
        return { success: true };
      } catch (error) {
        const message = error.response?.data?.error || 'Ошибка при отправке кода';
        toast.error(message);
        return { success: false, error: message };
      }
    },

    resetPassword: async (email, otpCode, newPassword) => {
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
    },

    changePassword: async (currentPassword, newPassword) => {
      try {
        await authService.changePassword(currentPassword, newPassword);
        toast.success('Пароль успешно изменен!');
        return { success: true };
      } catch (error) {
        const message = error.response?.data?.error || error.response?.data?.message || 'Ошибка при изменении пароля';
        toast.error(message);
        return { success: false, error: message };
      }
    },

    loadUser: async () => {
      try {
        const userData = await authService.getCurrentUser();
        set({ user: userData });
        return userData;
      } catch (error) {
        console.error('Failed to load user:', error);
        return null;
      }
    },
  };
});

// Экспортируем функцию для обновления ролей глобально (для использования в api.js)
if (typeof window !== 'undefined') {
  window.updateUserRoles = (token) => {
    useAuthStore.getState().updateUserRoles(token);
  };
}

