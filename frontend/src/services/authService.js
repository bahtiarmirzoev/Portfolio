import api from './api';

export const authService = {
  async signUp(data) {
    const response = await api.post('/auth/sign-up', {
      username: data.username,
      password: data.password,
      confirmPassword: data.confirmPassword,
      email: data.email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
    });
    return response.data;
  },

  async signIn(username, password) {
    const response = await api.post('/auth/sign-in', {
      username,
      password,
    });
    return response.data;
  },

  async signOut() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      await api.post('/auth/sign-out', {
        accessToken,
        refreshToken,
      });
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async refreshToken(accessToken, refreshToken) {
    const response = await api.post('/auth/token/refresh', {
      accessToken,
      refreshToken,
    });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(email, otpCode, newPassword) {
    const response = await api.post('/auth/reset-password', {
      email,
      otpCode,
      newPassword,
    });
    return response.data;
  },

  async checkAuth() {
    const response = await api.get('/auth/check');
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

