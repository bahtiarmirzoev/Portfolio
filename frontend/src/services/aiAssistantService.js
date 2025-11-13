import api from './api';

export const aiAssistantService = {
  async chat(message, preferences = null) {
    try {
      const response = await api.post('/ai/chat', {
        message,
        preferences,
      });
      return response.data;
    } catch (error) {
      console.error('AI Assistant error:', error);
      console.error('Request URL:', error.config?.url);
      console.error('Full URL:', error.config?.baseURL + error.config?.url);
      throw error;
    }
  },

  async askQuestion(question) {
    try {
      const response = await api.post('/ai/question', {
        message: question,
      });
      return response.data;
    } catch (error) {
      console.error('AI Assistant question error:', error);
      throw error;
    }
  },
};

