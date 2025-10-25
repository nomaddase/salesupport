import { create } from 'zustand';

const useStore = create((set, get) => ({
  clients: [],
  currentUser: null,
  currentClient: null,
  messages: [],
  dashboardStats: null,
  reminders: [],
  aiSuggestions: [],
  isDashboardOpen: false,
  setClients: (clients) => set({ clients }),
  addClient: (client) =>
    set((state) => ({
      clients: [...state.clients, client]
    })),
  setCurrentUser: (currentUser) => set({ currentUser }),
  setCurrentClient: (currentClient) => set({ currentClient }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) =>
    set((state) => ({ messages: [...state.messages, { id: Date.now(), ...message }] })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, ...patch } : message
      )
    })),
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  setReminders: (reminders) => set({ reminders }),
  addReminder: (reminder) =>
    set((state) => ({
      reminders: [...state.reminders, reminder]
    })),
  setAiSuggestions: (aiSuggestions) => set({ aiSuggestions }),
  toggleDashboard: () => set((state) => ({ isDashboardOpen: !state.isDashboardOpen })),
  clearWorkspace: () =>
    set({
      currentClient: null,
      messages: [],
      aiSuggestions: [],
      reminders: [],
      dashboardStats: get().dashboardStats
    })
}));

export default useStore;
