import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Header from '@/components/Header';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    image_url: string | null;
    colors: string[];
    in_stock: boolean;
    is_on_sale: boolean;
    category: string;
    gender: string;
    description: string | null;
  };
}

export default function Wishlist() {
  const { user, loading } = useAuth();
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    setLoadingWishlist(true);
    
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id,
        products (
          id,
          name,
          price,
          original_price,
          image_url,
          colors,
          in_stock,
          is_on_sale,
          category,
          gender,
          description
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch wishlist",
        variant: "destructive"
      });
    } else {
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        product: item.products as any
      })).filter(item => item.product); // Filter out items where product is null
      
      setWishlistItems(transformedData);
    }
    
    setLoadingWishlist(false);
  };

  const removeFromWishlist = async (wishlistId: string) => {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', wishlistId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Removed",
        description: "Item removed from wishlist"
      });
      fetchWishlist();
    }
  };

  const addToCart = (item: WishlistItem) => {
    const product: Product = {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      original_price: item.product.original_price || undefined,
      image_url: item.product.image_url || undefined,
      category: item.product.category,
      gender: item.product.gender,
      colors: item.product.colors,
      in_stock: item.product.in_stock,
      is_on_sale: item.product.is_on_sale,
      description: item.product.description || undefined
    };
    
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${item.product.name} has been added to your cart.`
    });
  };

  if (loading || loadingWishlist) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-light">My Wishlist</h1>
          <span className="text-muted-foreground">({wishlistItems.length} items)</span>
        </div>

        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-light mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Start adding items you love!</p>
              <Button onClick={() => window.location.href = '/'}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group">
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No Image</span>
                      </div>
                    )}
                    
                    {item.product.is_on_sale && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded">
                        Sale
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromWishlist(item.id)}
                        className="bg-background/80 hover:bg-background"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium mb-2 line-clamp-2">{item.product.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold">R{item.product.price}</span>
                      {item.product.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          R{item.product.original_price}
                        </span>
                      )}
                    </div>
                    
                    {item.product.colors.length > 0 && (
                      <div className="flex gap-1 mb-3">
                        {item.product.colors.slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                        ))}
                      </div>
                    )}
                    
                    <Button
                      onClick={() => addToCart(item)}
                      disabled={!item.product.in_stock}
                      className="w-full"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {item.product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}