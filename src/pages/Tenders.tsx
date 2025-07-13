import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TenderCard } from '@/components/TenderCard';
import { TenderDetails } from '@/components/TenderDetails';
import { TenderSearch, SearchFilters } from '@/components/TenderSearch';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, Grid3X3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TenderApiService } from '@/services/tenderApi';
import { Release } from '@/types/tender';

export default function Tenders() {
  const [selectedTender, setSelectedTender] = useState<Release | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    status: 'all',
    category: 'all',
    province: 'gauteng',
    sortBy: 'date'
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tenders', filters.province],
    queryFn: () => TenderApiService.getAllTenders(1, 2000, filters.province),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and sort releases
  const filteredReleases = useMemo(() => {
    if (!data?.releases) return [];

    let filtered = data.releases.filter(release => {
      const tender = release.tender;
      if (!tender) return false;

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchText = [
          tender.title,
          tender.description,
          release.ocid,
          release.buyer?.name,
          tender.procuringEntity?.name
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchText.includes(query)) return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const status = tender.status?.toLowerCase() || '';
        if (!status.includes(filters.status.toLowerCase())) return false;
      }

      // Category filter
      if (filters.category !== 'all') {
        const category = tender.mainProcurementCategory?.toLowerCase() || '';
        const categorySearchTerms = {
          'programming': ['programming'],
          'informationServiceActivities': ['information service activities', 'information service'],
          'informationAndCommunication': ['information and communication', 'information communication'],
          'computerProgrammingConsultancy': ['computer programming', 'consultancy and related activities', 'computer consultancy'],
          'goods': ['goods'],
          'services': ['services'],
          'works': ['works'],
          'consultingServices': ['consulting services', 'consulting']
        };
        
        const searchTerms = categorySearchTerms[filters.category as keyof typeof categorySearchTerms];
        if (searchTerms && !searchTerms.some(term => category.includes(term.toLowerCase()))) {
          return false;
        } else if (!searchTerms && !category.includes(filters.category.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Sort releases
    filtered.sort((a, b) => {
      const tenderA = a.tender!;
      const tenderB = b.tender!;

      switch (filters.sortBy) {
        case 'title':
          return (tenderA.title || '').localeCompare(tenderB.title || '');
        case 'value':
          const valueA = tenderA.value?.amount || 0;
          const valueB = tenderB.value?.amount || 0;
          return valueB - valueA;
        case 'status':
          return (tenderA.status || '').localeCompare(tenderB.status || '');
        case 'closingDate':
          const endA = tenderA.tenderPeriod?.endDate || '';
          const endB = tenderB.tenderPeriod?.endDate || '';
          return endB.localeCompare(endA);
        case 'date':
        default:
          return (b.date || '').localeCompare(a.date || '');
      }
    });

    return filtered;
  }, [data?.releases, filters]);

  const handleViewDetails = (release: Release) => {
    setSelectedTender(release);
  };

  const handleBackToList = () => {
    setSelectedTender(null);
  };

  if (selectedTender) {
    return (
      <div className="container mx-auto px-4 py-6">
        <TenderDetails release={selectedTender} onBack={handleBackToList} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              South African Government Tenders
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto sm:mx-0 mt-2">
              Discover procurement opportunities from the South African government. 
              Browse, search, and track tender opportunities across all departments.
            </p>
          </div>
          
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Button variant="secondary" size="sm" className="flex items-center gap-2 animate-fade-in">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Cards View</span>
              <span className="sm:hidden">Cards</span>
            </Button>
            <Button variant="outline" size="sm" asChild className="animate-fade-in">
              <Link to="/table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                <span className="hidden sm:inline">Table View</span>
                <span className="sm:hidden">Table</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <TenderSearch 
        filters={filters} 
        onFiltersChange={setFilters}
        isLoading={isLoading}
      />

      {/* Results Summary */}
      {!isLoading && filteredReleases.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Badge variant="secondary" className="text-sm">
              {filteredReleases.length} tender{filteredReleases.length !== 1 ? 's' : ''}
            </Badge>
            {data?.releases && filteredReleases.length !== data.releases.length && (
              <span className="text-xs sm:text-sm text-muted-foreground">
                of {data.releases.length} total
              </span>
            )}
          </div>
          
          {data?.links?.next && (
            <Button variant="outline" size="sm" className="hover-scale">
              Load More
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading tenders..." />
      ) : error ? (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load tenders'}
          onRetry={() => refetch()}
        />
      ) : filteredReleases.length === 0 ? (
        <div className="text-center py-8 sm:py-12 animate-fade-in">
          <h3 className="text-lg font-semibold mb-2">No tenders found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or clearing your filters.
          </p>
          <Button
            variant="outline"
            className="mt-4 hover-scale"
            onClick={() => setFilters({
              searchQuery: '',
              status: 'all',
              category: 'all',
              province: 'gauteng',
              sortBy: 'date'
            })}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">{filteredReleases.map((release, index) => (
            <TenderCard
              key={release.ocid || index}
              release={release}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}