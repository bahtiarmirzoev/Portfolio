'use client';

import { useState, useEffect } from 'react';
import { Client, CreateClientRequest, UpdateClientRequest } from '@/types/client';
import { clientApi } from '@/services/api';
import ClientTable from '@/components/ClientTable';
import ClientForm from '@/components/ClientForm';

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await clientApi.getAll();
      setClients(data);
    } catch (err) {
      setError('Failed to load clients');
      console.error('Error loading clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async (clientData: CreateClientRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newClient = await clientApi.create(clientData);
      setClients(prev => [...prev, newClient]);
      setShowForm(false);
    } catch (err) {
      setError('Failed to create client');
      console.error('Error creating client:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async (clientData: UpdateClientRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await clientApi.update(clientData);
      setClients(prev => prev.map(client => 
        client.id === clientData.id ? { ...client, ...clientData } : client
      ));
      setShowForm(false);
      setEditingClient(undefined);
    } catch (err) {
      setError('Failed to update client');
      console.error('Error updating client:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      setError(null);
      await clientApi.delete(id);
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err) {
      setError('Failed to delete client');
      console.error('Error deleting client:', err);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(undefined);
    setError(null);
  };

  const handleSubmit = (clientData: CreateClientRequest | UpdateClientRequest) => {
    if ('id' in clientData) {
      handleUpdateClient(clientData);
    } else {
      handleAddClient(clientData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ContactBook
              </h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-300 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Client</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl backdrop-blur-sm animate-pulse">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client List */}
          <div className="lg:col-span-2">
            <ClientTable
              clients={clients}
              onEdit={handleEdit}
              onDelete={handleDeleteClient}
              isLoading={isLoading}
            />
          </div>

          {/* Form Sidebar */}
          {showForm && (
            <div className="lg:col-span-1 animate-slideIn">
              <ClientForm
                client={editingClient}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
