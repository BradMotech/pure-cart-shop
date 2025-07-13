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
import { Eye, ExternalLink, Calendar, DollarSign, Hash, Building } from 'lucide-react';

interface TenderTableProps {
  releases: Release[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (release: Release) => void;
  isLoading?: boolean;
}

export function TenderTable({
  releases,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onViewDetails,
  isLoading
}: TenderTableProps) {
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
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sm:w-[250px]">Title</TableHead>
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
              <TableRow key={index}>
                <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell className="hidden sm:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-20" /></TableCell>
                <TableCell className="hidden md:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-32" /></TableCell>
                <TableCell><div className="h-4 bg-muted animate-pulse rounded w-16" /></TableCell>
                <TableCell className="hidden lg:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-20" /></TableCell>
                <TableCell className="hidden sm:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-24" /></TableCell>
                <TableCell className="hidden md:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-20" /></TableCell>
                <TableCell><div className="h-4 bg-muted animate-pulse rounded w-16" /></TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sm:w-[250px]">Title</TableHead>
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
                <TableCell colSpan={8} className="h-24 text-center">
                  No tenders found.
                </TableCell>
              </TableRow>
            ) : (
              releases.map((release, index) => {
                const tender = release.tender;
                if (!tender) return null;

                return (
                  <TableRow key={release.ocid || index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-semibold text-sm">
                          {tender.title || 'Untitled Tender'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          OCID: {release.ocid || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-mono">
                          {tender.id || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {release.buyer?.name || tender.procuringEntity?.name || 'Not specified'}
                          </span>
                        </div>
                        {tender.mainProcurementCategory && (
                          <Badge className="bg-success text-white hover:bg-success/90 text-xs">
                            {tender.mainProcurementCategory}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(tender.status)}>
                        {tender.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">
                        {tender.mainProcurementCategory || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatValue(release)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(tender.tenderPeriod?.endDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(release)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, releases.length)} of {releases.length} results
          </div>
          {renderPagination()}
        </div>
      )}
    </div>
  );
}