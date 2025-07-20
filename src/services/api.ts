import axios from 'axios';
import { Client, CreateClientRequest, UpdateClientRequest } from '@/types/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const clientApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get<Client[]>('/client');
    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await api.get<Client>(`/client/${id}`);
    return response.data;
  },

  create: async (client: CreateClientRequest): Promise<Client> => {
    const response = await api.post<Client>('/client', client);
    return response.data;
  },

  update: async (client: UpdateClientRequest): Promise<void> => {
    await api.put(`/client/${client.id}`, client);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/client/${id}`);
  },
}; 