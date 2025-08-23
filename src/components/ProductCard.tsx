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
      <div className="relative overflow-hidden bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300">
        {product.is_on_sale && (
          <div className="absolute top-4 left-4 z-10 bg-black text-white px-3 py-1 text-xs font-medium uppercase tracking-wider">
            Sale
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWishlistToggle}
            className="h-10 w-10 p-0 bg-white/95 hover:bg-white border border-gray-200 shadow-sm backdrop-blur-sm"
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-black text-black' : 'text-gray-600'}`} />
          </Button>

          {/* Enhanced Zoom Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 bg-white/95 hover:bg-white border border-gray-200 shadow-sm backdrop-blur-sm"
              >
                <ZoomIn className="h-4 w-4 text-gray-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-0 bg-transparent">
              <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <div className="p-6 border-t border-gray-100">
                  <h3 className="text-xl font-light text-black mb-2">{product.name}</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-medium text-black">R{product.price}</span>
                    {product.original_price && (
                      <span className="text-gray-500 line-through text-sm">
                        R{product.original_price}
                      </span>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-gray-600 mt-3 text-sm leading-relaxed">{product.description}</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent group-hover:from-black/10 transition-all duration-300" />
        
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 space-y-3">
          {/* Quantity Selector */}
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setQuantity(Math.max(1, quantity - 1));
              }}
              className="h-8 w-8 p-0 bg-white/95 border-gray-300 hover:bg-white hover:border-black transition-colors"
            >
              <Minus className="h-3 w-3 text-gray-700" />
            </Button>
            <span className="bg-white/95 px-4 py-1 text-sm font-medium text-black min-w-[3rem] text-center">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setQuantity(quantity + 1);
              }}
              className="h-8 w-8 p-0 bg-white/95 border-gray-300 hover:bg-white hover:border-black transition-colors"
            >
              <Plus className="h-3 w-3 text-gray-700" />
            </Button>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-black/95 text-white hover:bg-black border-0 backdrop-blur-sm font-medium py-2 transition-all duration-300"
          >
            Add to Cart
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {/* Product Name */}
        <h3 className="text-black font-light text-base leading-tight">{product.name}</h3>

        {/* Price */}
        <div className="flex items-center space-x-3">
          <span className="text-black font-medium text-lg">R{product.price}</span>
          {product.original_price && (
            <span className="text-gray-500 line-through text-sm">
              R{product.original_price}
            </span>
          )}
        </div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-600 uppercase tracking-wider font-medium">Colors</span>
            <div className="flex space-x-2">
              {product.colors.slice(0, 4).map((color, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(color);
                  }}
                  className={`h-5 w-5 rounded-full border-2 transition-all duration-200 ${
                    selectedColor === color ? 'border-black scale-110' : 'border-gray-300 hover:border-gray-500'
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
          </div>
        )}

        {/* Category */}
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {product.category}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;