import { create } from 'zustand';

const useStore = create((set) => ({
  clients: [],
  currentUser: null,
  setClients: (clients) => set({ clients }),
  setCurrentUser: (currentUser) => set({ currentUser })
}));

export default useStore;
