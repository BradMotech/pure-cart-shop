import { Search, User, Heart, ShoppingBag, Menu, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Header = () => {
  const { totalItems, toggleCart } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left - Logo and Navigation */}
          <div className="flex items-center space-x-12">
            <button 
              onClick={() => navigate('/')}
              className="text-2xl font-light text-black hover:text-gray-600 transition-colors tracking-wide"
            >
              YEWA
            </button>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/')}
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors uppercase tracking-wider"
              >
                Shop
              </button>
              <button className="text-sm font-medium text-gray-700 hover:text-black transition-colors uppercase tracking-wider">
                About
              </button>
              {!user && (
                <button 
                  onClick={() => navigate('/admin-login')}
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors uppercase tracking-wider"
                >
                  Admin
                </button>
              )}
            </nav>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-6">
            <Button variant="ghost" size="sm" className="hidden md:flex p-2 hover:bg-gray-100">
              <Search className="h-5 w-5 text-gray-700" />
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
                    <User className="h-5 w-5 text-gray-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-gray-200">
                  <DropdownMenuItem onClick={() => navigate('/account')} className="text-gray-700 hover:bg-gray-50">
                    My Account
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="text-gray-700 hover:bg-gray-50">
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem onClick={signOut} className="text-gray-700 hover:bg-gray-50">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="p-2 hover:bg-gray-100">
                <User className="h-5 w-5 text-gray-700" />
              </Button>
            )}
            
            <Button variant="ghost" size="sm" onClick={() => navigate('/wishlist')} className="relative p-2 hover:bg-gray-100">
              <Heart className="h-5 w-5 text-gray-700" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {wishlistCount}
                </span>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => location.pathname === '/cart' ? toggleCart() : navigate('/cart')}
              className="relative p-2 hover:bg-gray-100"
            >
              <ShoppingBag className="h-5 w-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
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