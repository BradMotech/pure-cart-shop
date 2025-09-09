import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const CartSidebar = () => {
  const { 
    state, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    closeCart, 
    totalPrice 
  } = useCart();

  return (
    <Sheet open={state.isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-shop-border pb-4">
          <SheetTitle className="text-left">Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-shop-text-light text-lg">Your cart is empty</div>
                <Button onClick={closeCart} className="bg-shop-accent text-shop-surface">
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6 space-y-6">
                {state.items.map((item) => {
                  const itemId = `${item.product.id}-${item.selectedColor}`;
                  
                  return (
                    <div key={itemId} className="flex space-x-4">
                      <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-shop-surface">
        <img
          src={item.product.image_url || '/placeholder.svg'}
          alt={item.product.name}
          className="h-full w-full object-cover"
        />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-shop-text">
                              {item.product.name}
                            </h3>
                            {item.selectedColor && (
                              <p className="text-xs text-shop-text-light capitalize">
                                {item.selectedColor}
                              </p>
                            )}
                            <p className="text-sm text-shop-text">R{item.product.price}</p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(itemId)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-shop-border pt-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{totalPrice >= 999 ? 'Free' : 'R110.00'}</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>R{(totalPrice + (totalPrice >= 999 ? 0 : 110)).toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full bg-shop-accent text-shop-surface">
                    Checkout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;