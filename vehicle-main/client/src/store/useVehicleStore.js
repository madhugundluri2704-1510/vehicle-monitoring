import { create } from 'zustand';
import api from '../services/api';

const useVehicleStore = create((set, get) => ({
  vehicles: [],
  selectedVehicle: null,
  stats: null,
  loading: false,
  error: null,
  filters: { status: '', type: '', zone: '', search: '' },

  fetchVehicles: async (params = {}) => {
    set({ loading: true });
    try {
      const { filters } = get();
      const query = { ...filters, ...params };
      const queryStr = Object.entries(query).filter(([,v]) => v).map(([k,v]) => `${k}=${v}`).join('&');
      const { data } = await api.get(`/vehicles?${queryStr}`);
      set({ vehicles: data.vehicles || data, loading: false });
    } catch (err) { set({ error: err.message, loading: false }); }
  },

  fetchVehicle: async (id) => {
    try {
      const { data } = await api.get(`/vehicles/${id}`);
      set({ selectedVehicle: data });
    } catch (err) { set({ error: err.message }); }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/vehicles/stats');
      set({ stats: data });
    } catch (err) { set({ error: err.message }); }
  },

  updateVehiclePosition: (update) => {
    set((state) => ({
      vehicles: state.vehicles.map(v => v._id === update._id ? { ...v, ...update } : v)
    }));
  },

  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  createVehicle: async (vehicleData) => {
    const { data } = await api.post('/vehicles', vehicleData);
    set((state) => ({ vehicles: [data, ...state.vehicles] }));
    return data;
  },
  updateVehicle: async (id, vehicleData) => {
    const { data } = await api.put(`/vehicles/${id}`, vehicleData);
    set((state) => ({ vehicles: state.vehicles.map(v => v._id === id ? data : v) }));
    return data;
  },
  deleteVehicle: async (id) => {
    await api.delete(`/vehicles/${id}`);
    set((state) => ({ vehicles: state.vehicles.filter(v => v._id !== id) }));
  }
}));

export default useVehicleStore;
