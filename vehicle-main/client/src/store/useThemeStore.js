import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('fleet-theme') || 'dark',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('fleet-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    return { theme: newTheme };
  }),
  initTheme: () => {
    const theme = localStorage.getItem('fleet-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    return set({ theme });
  }
}));

export default useThemeStore;
