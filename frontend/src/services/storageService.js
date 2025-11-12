import api from './api';

export const storageService = {
  async uploadPoster(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Поддерживаются только изображения JPEG, PNG или WEBP');
    }

    // Проверка размера (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Размер файла превышает 5MB');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/storage/posters', formData, {
      timeout: 60000, // 60 секунд для больших файлов
    });

    return response.data;
  },
};

