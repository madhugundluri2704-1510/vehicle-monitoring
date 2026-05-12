import { create } from 'zustand';
import api from '../services/api';

const useDriverStore = create((set, get) => ({
  drivers: [],
  selectedDriver: null,
  stats: null,
  loading: false,
  error: null,

  fetchDrivers: async (params = {}) => {
    set({ loading: true });
    try {
      const queryStr = Object.entries(params).filter(([,v]) => v).map(([k,v]) => `${k}=${v}`).join('&');
      const { data } = await api.get(`/drivers?${queryStr}`);
      set({ drivers: data.drivers || data, loading: false });
    } catch (err) { set({ error: err.message, loading: false }); }
  },

  fetchDriver: async (id) => {
    try {
      const { data } = await api.get(`/drivers/${id}`);
      set({ selectedDriver: data });
    } catch (err) { set({ error: err.message }); }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/drivers/stats');
      set({ stats: data });
    } catch (err) { set({ error: err.message }); }
  },

  createDriver: async (driverData) => {
    const { data } = await api.post('/drivers', driverData);
    set((state) => ({ drivers: [data, ...state.drivers] }));
    return data;
  },
  updateDriver: async (id, driverData) => {
    const { data } = await api.put(`/drivers/${id}`, driverData);
    set((state) => ({ drivers: state.drivers.map(d => d._id === id ? data : d) }));
    return data;
  },
  deleteDriver: async (id) => {
    await api.delete(`/drivers/${id}`);
    set((state) => ({ drivers: state.drivers.filter(d => d._id !== id) }));
  }
}));

export default useDriverStore;
