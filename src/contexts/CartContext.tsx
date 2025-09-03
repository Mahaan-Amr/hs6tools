"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku: string;
  category: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed values
  totalItems: number;
  totalPrice: number;
  itemCount: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (newItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          item => item.productId === newItem.productId && item.variantId === newItem.variantId
        );
        
        if (existingItemIndex > -1) {
          // Update existing item quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          set({ items: updatedItems });
        } else {
          // Add new item
          const itemWithId = {
            ...newItem,
            id: `${newItem.productId}-${newItem.variantId || 'base'}-${Date.now()}`
          };
          set({ items: [...items, itemWithId] });
        }
      },
      
      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter(item => item.id !== id) });
        } else {
          const updatedItems = items.map(item =>
            item.id === id ? { ...item, quantity } : item
          );
          set({ items: updatedItems });
        }
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },
      
      openCart: () => {
        set({ isOpen: true });
      },
      
      closeCart: () => {
        set({ isOpen: false });
      },
      
      get totalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      get totalPrice() {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      get itemCount() {
        return get().items.length;
      },
    }),
    {
      name: 'hs6tools-cart',
      partialize: (state) => ({ items: state.items }), // Only persist cart items
    }
  )
);
