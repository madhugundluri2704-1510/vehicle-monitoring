import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('kmc-user') || 'null'),
  token: localStorage.getItem('kmc-token') || null,
  isAuthenticated: !!localStorage.getItem('kmc-token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('kmc-token', data.token);
      localStorage.setItem('kmc-refresh-token', data.refreshToken);
      localStorage.setItem('kmc-user', JSON.stringify(data));
      set({ user: data, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { username, email, password, role: 'admin' });
      localStorage.setItem('kmc-token', data.token);
      localStorage.setItem('kmc-refresh-token', data.refreshToken);
      localStorage.setItem('kmc-user', JSON.stringify(data));
      set({ user: data, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('kmc-token');
    localStorage.removeItem('kmc-refresh-token');
    localStorage.removeItem('kmc-user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
