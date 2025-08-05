import { Star } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, product.colors?.[0]);
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden bg-shop-surface rounded-sm">
        {product.isOnSale && (
          <div className="absolute top-3 left-3 z-10 bg-shop-discount text-shop-surface px-2 py-1 text-xs font-medium rounded">
            -20%
          </div>
        )}
        
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
        {/* Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < product.rating
                  ? 'fill-shop-rating text-shop-rating'
                  : 'text-shop-border'
              }`}
            />
          ))}
          <span className="text-xs text-shop-text-light ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-shop-text font-medium">{product.name}</h3>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-shop-text font-medium">£{product.price}</span>
          {product.originalPrice && (
            <span className="text-shop-text-light line-through text-sm">
              £{product.originalPrice}
            </span>
          )}
        </div>

        {/* Colors */}
        {product.colors && (
          <div className="flex items-center space-x-2">
            {product.colors.slice(0, 3).map((color, index) => (
              <div
                key={index}
                className={`h-3 w-3 rounded-full border border-shop-border ${
                  color === 'black' ? 'bg-black' :
                  color === 'white' ? 'bg-white' :
                  color === 'grey' ? 'bg-gray-400' :
                  color === 'red' ? 'bg-red-500' :
                  color === 'green' ? 'bg-green-500' :
                  color === 'blue' ? 'bg-blue-500' :
                  color === 'orange' ? 'bg-orange-500' :
                  color === 'beige' ? 'bg-amber-200' :
                  'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;