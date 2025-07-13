import { Calendar, Building2, MapPin, FileText, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Release } from '@/types/tender';
import { TenderApiService } from '@/services/tenderApi';

interface TenderCardProps {
  release: Release;
  onViewDetails: (release: Release) => void;
}

export function TenderCard({ release, onViewDetails }: TenderCardProps) {
  const tender = release.tender;
  const buyer = release.buyer;
  
  if (!tender) return null;

  const handleViewDetails = () => {
    onViewDetails(release);
  };

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-card-foreground line-clamp-2 mb-2">
              {tender.title || 'Untitled Tender'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={TenderApiService.getStatusBadgeVariant(tender.status)}>
                {tender.status || 'Unknown'}
              </Badge>
              {tender.mainProcurementCategory && (
                <Badge variant="outline" className="text-xs">
                  {tender.mainProcurementCategory}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {tender.description && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-3 mt-3">
            {tender.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Buyer Information */}
        {buyer?.name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="font-medium">{buyer.name}</span>
          </div>
        )}

        {/* Procuring Entity */}
        {tender.procuringEntity?.name && tender.procuringEntity.name !== buyer?.name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Procuring: {tender.procuringEntity.name}</span>
          </div>
        )}

        {/* Value */}
        {tender.value?.amount && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="font-semibold text-success">
              {TenderApiService.formatCurrency(tender.value.amount, tender.value.currency)}
            </span>
          </div>
        )}

        {/* Tender Period */}
        {tender.tenderPeriod && (
          <div className="space-y-2">
            {tender.tenderPeriod.startDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Opens: {TenderApiService.formatDate(tender.tenderPeriod.startDate)}</span>
              </div>
            )}
            {tender.tenderPeriod.endDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-warning" />
                <span>Closes: {TenderApiService.formatDate(tender.tenderPeriod.endDate)}</span>
              </div>
            )}
          </div>
        )}

        {/* Documents Count */}
        {tender.documents && tender.documents.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 text-primary" />
            <span>{tender.documents.length} document{tender.documents.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* OCID */}
        {release.ocid && (
          <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
            OCID: {release.ocid}
          </div>
        )}

        <Button 
          onClick={handleViewDetails}
          className="w-full mt-4"
          variant="outline"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}