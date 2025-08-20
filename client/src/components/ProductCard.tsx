import { Star, Heart, Plus, Minus, ZoomIn } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    addItem(product, selectedColor, quantity);
  };

  const handleWishlistToggle = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden bg-shop-surface rounded-sm">
        {product.is_on_sale && (
          <div className="absolute top-3 left-3 z-10 bg-shop-discount text-shop-surface px-2 py-1 text-xs font-medium rounded">
            SALE
          </div>
        )}
        
        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white/90"
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>

        {/* Zoom Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-12 right-3 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="h-4 w-4 text-gray-600" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-auto rounded-lg"
            />
          </DialogContent>
        </Dialog>
        
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
          {/* Quantity Selector */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setQuantity(Math.max(1, quantity - 1));
              }}
              className="h-8 w-8 p-0 bg-white/90"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="bg-white/90 px-3 py-1 rounded text-sm font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setQuantity(quantity + 1);
              }}
              className="h-8 w-8 p-0 bg-white/90"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-shop-surface/90 text-shop-text hover:bg-shop-surface border border-shop-border backdrop-blur-sm"
            variant="outline"
          >
            Add to Cart
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {/* Product Name */}
        <h3 className="text-shop-text font-medium">{product.name}</h3>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-shop-text font-medium">R{product.price}</span>
          {product.original_price && (
            <span className="text-shop-text-light line-through text-sm">
              R{product.original_price}
            </span>
          )}
        </div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-shop-text-light">Colors:</span>
            {product.colors.slice(0, 4).map((color, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                className={`h-4 w-4 rounded-full border-2 ${
                  selectedColor === color ? 'border-shop-primary' : 'border-shop-border'
                } ${
                  color === 'black' ? 'bg-black' :
                  color === 'white' ? 'bg-white' :
                  color === 'grey' || color === 'gray' ? 'bg-gray-400' :
                  color === 'red' ? 'bg-red-500' :
                  color === 'green' ? 'bg-green-500' :
                  color === 'blue' ? 'bg-blue-500' :
                  color === 'orange' ? 'bg-orange-500' :
                  color === 'beige' ? 'bg-amber-200' :
                  color === 'brown' ? 'bg-amber-700' :
                  color === 'pink' ? 'bg-pink-400' :
                  color === 'purple' ? 'bg-purple-500' :
                  color === 'yellow' ? 'bg-yellow-400' :
                  'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Category */}
        <div className="text-xs text-shop-text-light">
          {product.category}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;