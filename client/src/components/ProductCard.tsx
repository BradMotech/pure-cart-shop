import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Plus, Minus } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
  };

  const handleWishlistToggle = async () => {
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-300 border-border/50">
      <CardContent className="p-4">
        <div className="relative overflow-hidden rounded-md mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-102"
          />
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 bg-background/80 backdrop-blur-sm ${
              inWishlist ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-foreground">{product.name}</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</p>
            <p className="text-lg font-semibold text-foreground mt-1">R{product.price}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">COLOR</p>
            <div className="flex space-x-1">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={`px-2 py-1 rounded text-xs border transition-colors ${
                    selectedColor === color
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                  }`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">SIZE</p>
            <div className="flex space-x-1">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`px-2 py-1 rounded text-xs border transition-colors ${
                    selectedSize === size
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 text-xs"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};