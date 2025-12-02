// services/api.ts - Ready for backend (currently disabled)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    // TODO: Uncomment when backend is ready
    // const url = `${API_BASE_URL}${endpoint}`;
    // const token = localStorage.getItem('authToken');

    // const headers = {
    //   'Content-Type': 'application/json',
    //   ...(token && { 'Authorization': `Bearer ${token}` }),
    //   ...options.headers,
    // };

    // const response = await fetch(url, { ...options, headers });
    // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    // return response.json();

    throw new Error('API not implemented yet - using mock data');
  },

  get(endpoint: string) {
    return this.request(endpoint);
  },

  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};