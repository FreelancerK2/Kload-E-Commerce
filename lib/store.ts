import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stockCount?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

          // Check stock limit if stockCount is provided
          if (item.stockCount !== undefined && newQuantity > item.stockCount) {
            console.warn(
              `Cannot add more items. Stock limit reached: ${item.stockCount}`
            );
            return state; // Return current state without changes
          }

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: newQuantity, stockCount: item.stockCount }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              // Check stock limit if stockCount is available
              if (item.stockCount !== undefined && quantity > item.stockCount) {
                console.warn(
                  `Cannot set quantity to ${quantity}. Stock limit is ${item.stockCount}`
                );
                return item; // Return item unchanged
              }
              return { ...item, quantity };
            }
            return item;
          }),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
