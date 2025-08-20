import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { PayfastButton } from '@/components/PayfastButton';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    state, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    totalPrice 
  } = useCart();

  if (!user) {
    return (
      <div className="min-h-screen bg-shop-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your cart</h1>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shop-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-shop-text mb-8">Shopping Cart</h1>

        {state.items.length === 0 ? (
          <div className="text-center py-16">
            <div className="space-y-4">
              <h2 className="text-xl text-shop-text-light">Your cart is empty</h2>
              <p className="text-shop-text-light">Add some products to get started</p>
              <Button 
                onClick={() => navigate('/')}
                variant="shop"
                className="mt-4"
              >
                Start Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {state.items.map((item) => {
                const itemId = `${item.product.id}-${item.selectedColor}`;
                
                return (
                  <div key={itemId} className="bg-shop-surface p-6 rounded-sm border border-shop-border">
                    <div className="flex space-x-6">
                      <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded bg-shop-background">
          <img
            src={item.product.image_url || '/placeholder.svg'}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-shop-text">
                              {item.product.name}
                            </h3>
                            {item.selectedColor && (
                              <p className="text-sm text-shop-text-light capitalize mt-1">
                                Color: {item.selectedColor}
                              </p>
                            )}
                            <p className="text-lg font-medium text-shop-text mt-2">
                              R{item.product.price}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(itemId)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(itemId, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="w-12 text-center">{item.quantity}</span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(itemId, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-lg font-medium">
                            R{(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-shop-surface p-6 rounded-sm border border-shop-border sticky top-24">
                <h2 className="text-lg font-semibold text-shop-text mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 border-b border-shop-border pb-4">
                  <div className="flex justify-between">
                    <span className="text-shop-text-light">Subtotal</span>
                    <span className="text-shop-text">R{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-shop-text-light">Shipping</span>
                    <span className="text-shop-text">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-shop-text-light">VAT (15%)</span>
                    <span className="text-shop-text">R{(totalPrice * 0.15).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 mb-6">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>R{(totalPrice * 1.15).toFixed(2)}</span>
                  </div>
                </div>

                <PayfastButton 
                  totalAmount={totalPrice * 1.15}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;