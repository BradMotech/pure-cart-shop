import { Search, FileText, Building, Globe, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
              <Building className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">eTenders Portal</h1>
              <p className="text-sm text-muted-foreground">Government Procurement Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Tenders
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentation
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              API Access
            </Button>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button variant="gradient" size="sm" asChild>
              <Link to="/table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                View All Tenders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}