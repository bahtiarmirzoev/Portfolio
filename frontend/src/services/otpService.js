import api from './api';

export const otpService = {
  async sendOtp(userId, email) {
    const response = await api.post('/otp/send', {
      userId,
      email,
    });
    return response.data;
  },

  async verifyOtp(userId, code) {
    const response = await api.post('/otp/verify', {
      userId,
      code,
    });
    return response.data;
  },
};

