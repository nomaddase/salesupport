import create from 'zustand';

const useStore = create((set) => ({
  clients: [],
  setClients: (clients) => set({ clients })
}));

export default useStore;
