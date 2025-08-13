import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlistItems: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching wishlist:', error);
    } else {
      setWishlistItems(data?.map(item => item.product_id) || []);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('wishlist')
      .insert([{ user_id: user.id, product_id: productId }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive"
      });
    } else {
      setWishlistItems(prev => [...prev, productId]);
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist"
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist",
        variant: "destructive"
      });
    } else {
      setWishlistItems(prev => prev.filter(id => id !== productId));
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist"
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      wishlistCount: wishlistItems.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};