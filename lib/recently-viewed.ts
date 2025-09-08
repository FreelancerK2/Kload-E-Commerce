import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  viewedAt: number; // timestamp
}

interface RecentlyViewedStore {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  getRecentItems: (limit?: number) => RecentlyViewedItem[];
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const newItem: RecentlyViewedItem = {
          ...item,
          viewedAt: Date.now(),
        };

        set((state) => {
          // Remove existing item if it exists
          const filteredItems = state.items.filter((i) => i.id !== item.id);

          // Add new item at the beginning
          const updatedItems = [newItem, ...filteredItems];

          // Keep only the last 20 items
          return {
            items: updatedItems.slice(0, 20),
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearAll: () => {
        set({ items: [] });
      },

      getRecentItems: (limit = 10) => {
        const { items } = get();
        return items.slice(0, limit);
      },
    }),
    {
      name: 'recently-viewed-storage',
      // Only persist the items array
      partialize: (state) => ({ items: state.items }),
    }
  )
);
