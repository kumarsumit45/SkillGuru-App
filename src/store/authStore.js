import { create } from 'zustand';

const useAuthStore = create((set) => ({
  uid: null,
  setUid: (uid) => set({ uid }),
  clearAuth: () => set({ uid: null, profileRefreshTrigger: 0 }),
  profileRefreshTrigger: 0,
  triggerProfileRefresh: () => set((state) => ({ profileRefreshTrigger: state.profileRefreshTrigger + 1 })),
}));

export default useAuthStore;
