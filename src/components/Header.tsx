import { Search, FileText, Building, Globe, Table, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 hover-scale">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg shadow-md">
              <Building className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">eTenders Portal</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Government Procurement</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-foreground">eTenders</h1>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2">
            {/* Primary CTA - Always visible */}
            <Button variant="gradient" size="sm" asChild className="animate-fade-in">
              <Link to="/table" className="flex items-center gap-1 sm:gap-2">
                <Table className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
              </Link>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover-scale">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover-scale">
              <FileText className="h-4 w-4" />
              Docs
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover-scale">
              <Globe className="h-4 w-4" />
              API
            </Button>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "max-h-64 pb-4" : "max-h-0"
        )}>
          <nav className="flex flex-col gap-2 pt-2 border-t animate-fade-in">
            <Button 
              variant="ghost" 
              className="justify-start gap-3 h-12 text-left"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Search className="h-4 w-4" />
              Search Tenders
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start gap-3 h-12 text-left"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              Documentation
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start gap-3 h-12 text-left"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Globe className="h-4 w-4" />
              API Access
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}