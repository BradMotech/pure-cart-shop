import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface SearchFilters {
  searchQuery: string;
  status: string;
  category: string;
  sortBy: string;
}

interface TenderSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export function TenderSearch({ filters, onFiltersChange, isLoading }: TenderSearchProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ ...filters, sortBy: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      status: 'all',
      category: 'all',
      sortBy: 'date'
    });
  };

  const hasActiveFilters = filters.searchQuery || filters.status !== 'all' || filters.category !== 'all';

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg shadow-card border">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tenders by title, description, or OCID..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4"
          disabled={isLoading}
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status:</span>
          <Select value={filters.status} onValueChange={handleStatusChange} disabled={isLoading}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Category:</span>
          <Select value={filters.category} onValueChange={handleCategoryChange} disabled={isLoading}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="goods">Goods</SelectItem>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="works">Works</SelectItem>
              <SelectItem value="consultingServices">Consulting Services</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort by:</span>
          <Select value={filters.sortBy} onValueChange={handleSortChange} disabled={isLoading}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="closingDate">Closing Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          {filters.searchQuery && (
            <Badge variant="outline" className="flex items-center gap-1">
              Search: "{filters.searchQuery}"
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => handleSearchChange('')}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {filters.status}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => handleStatusChange('all')}
              />
            </Badge>
          )}
          {filters.category !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Category: {filters.category}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => handleCategoryChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}