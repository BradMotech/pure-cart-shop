import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types/product';

export interface CartItem extends Product {
  quantity: number;
  color: string;
  size: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, color: string, size: string, quantity?: number) => void;
  removeFromCart: (id: string, color: string, size: string) => void;
  updateQuantity: (id: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, color: string, size: string, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(
        item => item.id === product.id && item.color === color && item.size === size
      );

      if (existingItem) {
        return prev.map(item =>
          item.id === product.id && item.color === color && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { ...product, quantity, color, size }];
    });
  };

  const removeFromCart = (id: string, color: string, size: string) => {
    setItems(prev => prev.filter(
      item => !(item.id === id && item.color === color && item.size === size)
    ));
  };

  const updateQuantity = (id: string, color: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, color, size);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.id === id && item.color === color && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getTotalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};