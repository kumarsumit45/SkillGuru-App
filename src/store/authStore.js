import { create } from 'zustand';

const useAuthStore = create((set) => ({
  uid: null,
  setUid: (uid) => set({ uid }),
  clearAuth: () => set({ uid: null }),
}));

export default useAuthStore;
