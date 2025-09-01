import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const resolveImageUrl = (image_url: string | null) => {
    if (image_url && image_url.startsWith("http")) return image_url;
    if (image_url) {
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(image_url);
      return data.publicUrl;
    }
    return "/placeholder.svg";
  };

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          product_id,
          products!inner (
            id,
            name,
            price,
            category,
            image_url,
            colors,
            sizes,
            description
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      return (data ?? []).map((item: any) => ({
        id: item.products.id,
        name: item.products.name,
        price: Number(item.products.price),
        category: item.products.category ?? "Uncategorized",
        image: resolveImageUrl(item.products.image_url),
        colors: (item.products.colors as string[] | null) ?? [],
        sizes: (item.products.sizes as string[] | null) ?? [],
        description: item.products.description ?? "",
      })) as Product[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (product: Product) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: product.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    },
  });

  const addToWishlist = async (product: Product) => {
    await addMutation.mutateAsync(product);
  };

  const removeFromWishlist = async (id: string) => {
    await removeMutation.mutateAsync(id);
  };

  const isInWishlist = (id: string) => {
    return items.some(item => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{
      items,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isLoading: isLoading || addMutation.isPending || removeMutation.isPending,
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