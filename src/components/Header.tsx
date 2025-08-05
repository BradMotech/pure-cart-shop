import { Search, User, Heart, ShoppingBag, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { totalItems, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-shop-border bg-shop-surface/95 backdrop-blur supports-[backdrop-filter]:bg-shop-surface/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left - Menu and Navigation */}
          <div className="flex items-center space-x-8">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button className="text-shop-text hover:text-shop-accent transition-colors">
                Shop
              </button>
              <button className="text-shop-text hover:text-shop-accent transition-colors">
                Journal
              </button>
              <button className="text-shop-text hover:text-shop-accent transition-colors">
                About
              </button>
            </nav>
          </div>

          {/* Center - Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-semibold text-shop-text hover:text-shop-accent transition-colors"
            >
              ✱ Loom & Co.
            </button>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
              <span className="hidden sm:ml-2 sm:inline">Account</span>
            </Button>
            
            <Button variant="ghost" size="sm">
              <Heart className="h-5 w-5" />
              <span className="hidden sm:ml-2 sm:inline">Wishlist (3)</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => location.pathname === '/cart' ? toggleCart() : navigate('/cart')}
              className="relative"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden sm:ml-2 sm:inline">
                Bag ({totalItems})
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-shop-accent text-shop-surface text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;