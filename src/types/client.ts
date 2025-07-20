export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateClientRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
} 