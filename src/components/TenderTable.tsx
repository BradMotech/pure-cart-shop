import { useState } from 'react';
import { Release } from '@/types/tender';
import { TenderApiService } from '@/services/tenderApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Eye, ExternalLink, Calendar, DollarSign, Hash, Building, MapPin } from 'lucide-react';

interface TenderTableProps {
  releases: Release[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (release: Release) => void;
  isLoading?: boolean;
  currentProvince?: string;
}

export function TenderTable({
  releases,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onViewDetails,
  isLoading,
  currentProvince = 'gauteng'
}: TenderTableProps) {
  // Get province name from current filter
  const getProvinceName = () => {
    const provinceMap: { [key: string]: string } = {
      'gauteng': 'Gauteng',
      'western-cape': 'Western Cape',
      'eastern-cape': 'Eastern Cape',
      'kwazulu-natal': 'KwaZulu-Natal',
      'limpopo': 'Limpopo',
      'mpumalanga': 'Mpumalanga',
      'northern-cape': 'Northern Cape',
      'north-west': 'North West',
      'free-state': 'Free State',
      'all-provinces': 'All Provinces'
    };
    return provinceMap[currentProvince] || 'South Africa';
  };

  const formatValue = (release: Release) => {
    const tender = release.tender;
    if (!tender?.value?.amount) return 'Not specified';
    return TenderApiService.formatCurrency(tender.value.amount, tender.value.currency);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return TenderApiService.formatDate(dateString);
  };

  const getStatusVariant = (status: string | null) => {
    return TenderApiService.getStatusBadgeVariant(status);
  };

  const renderPagination = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (showEllipsis) {
      // Show first page
      pages.push(1);
      
      // Show ellipsis if current page is far from start
      if (currentPage > 4) {
        pages.push('ellipsis-start');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 3) {
        pages.push('ellipsis-end');
      }
      
      // Show last page
      if (totalPages > 1 && !pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    } else {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page as number);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-subtle border-0 shadow-card">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opacity-60" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] sm:w-[300px]">Title & Description</TableHead>
                <TableHead className="hidden sm:table-cell">Tender No.</TableHead>
                <TableHead className="hidden md:table-cell">Organ of State</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Value</TableHead>
                <TableHead className="hidden md:table-cell">Closing Date</TableHead>
                <TableHead className="w-[80px] sm:w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(pageSize)].map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  <TableCell>
                    <div className="space-y-3">
                      <div className="h-5 bg-muted/60 rounded-lg" />
                      <div className="h-4 bg-muted/40 rounded-lg w-3/4" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="h-4 bg-muted/60 rounded-lg w-20" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="h-4 bg-muted/60 rounded-lg w-32" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 bg-muted/60 rounded-full w-16" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="h-4 bg-muted/60 rounded-lg w-20" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="h-4 bg-muted/60 rounded-lg w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="h-4 bg-muted/60 rounded-lg w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-muted/60 rounded-lg w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-subtle border-0 shadow-card hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
        <Table>
          <TableHeader>
            <TableRow className="border-0">
              <TableHead className="w-[200px] sm:w-[300px]">Title & Description</TableHead>
              <TableHead className="hidden sm:table-cell">Tender No.</TableHead>
              <TableHead className="hidden md:table-cell">Organ of State</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell">Value</TableHead>
              <TableHead className="hidden md:table-cell">Closing Date</TableHead>
              <TableHead className="w-[80px] sm:w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {releases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                      <Eye className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg font-medium">No tenders found.</p>
                    <p className="text-muted-foreground text-sm">Try adjusting your search filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              releases.map((release, index) => {
                const tender = release.tender;
                if (!tender) return null;

                return (
                  <TableRow key={release.ocid || index} className="group hover:bg-primary/2 transition-all duration-300">
                    <TableCell className="font-medium">
                      <div className="space-y-3">
                        <div className="font-bold text-foreground text-base group-hover:text-primary transition-colors duration-300">
                          {tender.title || 'Untitled Tender'}
                        </div>
                        {tender.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2 max-w-xs leading-relaxed">
                            {tender.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded-md w-fit">
                          OCID: {release.ocid || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Hash className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm font-mono font-medium">
                          {tender.id || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {release.buyer?.name || tender.procuringEntity?.name || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tender.mainProcurementCategory && (
                            <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20 text-xs font-medium px-3 py-1 rounded-full">
                              {tender.mainProcurementCategory}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs font-medium px-3 py-1 rounded-full border-primary/20 text-primary">
                            <MapPin className="h-3 w-3 mr-1" />
                            {getProvinceName()}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(tender.status)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-full"
                      >
                        {tender.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm font-medium text-foreground">
                        {tender.mainProcurementCategory || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2 p-2 bg-success/5 rounded-lg border border-success/20">
                        <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                          <DollarSign className="h-3 w-3 text-success" />
                        </div>
                        <span className="text-sm font-bold text-success">
                          {formatValue(release)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2 p-2 bg-warning/5 rounded-lg border border-warning/20">
                        <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center">
                          <Calendar className="h-3 w-3 text-warning" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(tender.tenderPeriod?.endDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => onViewDetails(release)}
                        className="bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 border-0 font-semibold h-9 px-4 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1.5" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-gradient-subtle rounded-xl p-4 border border-border/50">
          <div className="text-sm text-muted-foreground font-medium">
            Showing <span className="font-bold text-foreground">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * pageSize, releases.length)}</span> of <span className="font-bold text-foreground">{releases.length}</span> results
          </div>
          {renderPagination()}
        </div>
      )}
    </div>
  );
}