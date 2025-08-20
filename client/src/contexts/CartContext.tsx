import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, Product } from '@/types/product';
import { toast } from '@/hooks/use-toast';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface AddItemPayload {
  product: Product;
  selectedColor?: string;
  quantity?: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const itemId = `${action.payload.product.id}-${action.payload.selectedColor}`;
      const existingItem = state.items.find(item => 
        `${item.product.id}-${item.selectedColor}` === itemId
      );
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            `${item.product.id}-${item.selectedColor}` === itemId
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, {
          product: action.payload.product,
          quantity: action.payload.quantity || 1,
          selectedColor: action.payload.selectedColor
        }]
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => 
          `${item.product.id}-${item.selectedColor}` !== action.payload
        ),
      };

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => 
            `${item.product.id}-${item.selectedColor}` !== action.payload.id
          ),
        };
      }

      return {
        ...state,
        items: state.items.map(item =>
          `${item.product.id}-${item.selectedColor}` === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };

    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (product: Product, selectedColor?: string, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  const addItem = (product: Product, selectedColor?: string, quantity: number = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { product, selectedColor, quantity }
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const removeItem = (id: string) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: id,
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        totalItems,
        totalPrice,
      }}
    >
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