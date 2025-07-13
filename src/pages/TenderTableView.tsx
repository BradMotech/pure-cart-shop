import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TenderTable } from '@/components/TenderTable';
import { TenderDetails } from '@/components/TenderDetails';
import { TenderSearch, SearchFilters } from '@/components/TenderSearch';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Grid3X3, Table } from 'lucide-react';
import { TenderApiService } from '@/services/tenderApi';
import { Release } from '@/types/tender';
import { Link } from 'react-router-dom';

export default function TenderTableView() {
  const [selectedTender, setSelectedTender] = useState<Release | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    status: 'all',
    category: 'all',
    province: 'gauteng',
    sortBy: 'date'
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tenders', filters.province, currentPage],
    queryFn: () => TenderApiService.getAllTenders(currentPage, 2000, filters.province),
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
        // Handle exact status matching
        if (status !== filters.status.toLowerCase()) return false;
      }

      // Category filter
      if (filters.category !== 'all') {
        const category = tender.mainProcurementCategory?.toLowerCase() || '';
        const additionalCategories = tender.additionalProcurementCategories?.map(cat => cat.toLowerCase()) || [];
        
        // Check both main and additional categories
        const allCategories = [category, ...additionalCategories].filter(Boolean);
        
        // Simple exact matching for category filters
        const categoryMatches = allCategories.some(cat => {
          if (filters.category === 'consultingServices') {
            return cat.includes('consulting') || cat.includes('consultancy');
          }
          if (filters.category === 'computerProgrammingConsultancy') {
            return cat.includes('computer') || cat.includes('programming') || cat.includes('consultancy');
          }
          if (filters.category === 'informationServiceActivities') {
            return cat.includes('information') && cat.includes('service');
          }
          if (filters.category === 'informationAndCommunication') {
            return cat.includes('information') && cat.includes('communication');
          }
          return cat === filters.category.toLowerCase();
        });
        
        if (!categoryMatches) return false;
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

  // Calculate pagination
  const totalItems = filteredReleases.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = filteredReleases.slice(startIndex, endIndex);

  const handleViewDetails = (release: Release) => {
    setSelectedTender(release);
  };

  const handleBackToList = () => {
    setSelectedTender(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedTender) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-6">
          <TenderDetails release={selectedTender} onBack={handleBackToList} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 hover-scale">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Cards View</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              All Tenders - Table View
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Browse all government procurement opportunities in a detailed table format.
            </p>
          </div>
          
          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <Button variant="outline" size="sm" asChild className="animate-fade-in">
              <Link to="/" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">Cards View</span>
                <span className="sm:hidden">Cards</span>
              </Link>
            </Button>
            <Button variant="secondary" size="sm" className="flex items-center gap-2 animate-fade-in">
              <Table className="h-4 w-4" />
              <span className="hidden sm:inline">Table View</span>
              <span className="sm:hidden">Table</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <TenderSearch 
          filters={filters} 
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1); // Reset to first page when filtering
          }}
          isLoading={isLoading}
        />

        {/* Results Summary */}
        {!isLoading && filteredReleases.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Badge variant="secondary" className="text-sm">
                {totalItems} tender{totalItems !== 1 ? 's' : ''} found
              </Badge>
              {data?.releases && filteredReleases.length !== data.releases.length && (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  (filtered from {data.releases.length} total)
                </span>
              )}
              <span className="text-xs sm:text-sm text-muted-foreground">
                • Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        {error ? (
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Failed to load tenders'}
            onRetry={() => refetch()}
          />
        ) : filteredReleases.length === 0 && !isLoading ? (
          <div className="text-center py-8 sm:py-12 animate-fade-in">
            <h3 className="text-lg font-semibold mb-2">No tenders found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or clearing your filters.
            </p>
            <Button
              variant="outline"
              className="mt-4 hover-scale"
              onClick={() => {
                setFilters({
                  searchQuery: '',
                  status: 'all',
                  category: 'all',
                  province: 'gauteng',
                  sortBy: 'date'
                });
                setCurrentPage(1);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <TenderTable
            releases={currentPageData}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onViewDetails={handleViewDetails}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}