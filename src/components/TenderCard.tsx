import { Calendar, Building2, MapPin, FileText, Clock, DollarSign, Hash, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Release } from '@/types/tender';
import { TenderApiService } from '@/services/tenderApi';

interface TenderCardProps {
  release: Release;
  onViewDetails: (release: Release) => void;
  currentProvince?: string;
}

export function TenderCard({ release, onViewDetails, currentProvince = 'gauteng' }: TenderCardProps) {
  const tender = release.tender;
  const buyer = release.buyer;
  
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
  
  if (!tender) return null;

  const handleViewDetails = () => {
    onViewDetails(release);
  };

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold text-card-foreground line-clamp-2 mb-2 leading-snug">
              {tender.title || 'Untitled Tender'}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <Badge variant={TenderApiService.getStatusBadgeVariant(tender.status)} className="text-xs">
                {tender.status || 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>
        
        {tender.description && (
          <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mt-3 leading-relaxed">
            {tender.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
        {/* Tender Number */}
        {tender.id && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
            <span className="font-medium truncate">Tender No: {tender.id}</span>
          </div>
        )}

        {/* Organ of State (Buyer) */}
        {buyer?.name && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Building className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
              <span className="font-medium truncate">Organ of State: {buyer.name}</span>
            </div>
            {/* Category Badge */}
            {tender.mainProcurementCategory && (
              <div className="flex items-center gap-2">
                <div className="w-3 sm:w-4"></div> {/* Spacer to align with icon above */}
                <Badge className="bg-success text-white hover:bg-success/90 text-xs">
                  {tender.mainProcurementCategory}
                </Badge>
              </div>
            )}
            {/* Province Badge */}
            <div className="flex items-center gap-2">
              <div className="w-3 sm:w-4"></div> {/* Spacer to align with icon above */}
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {getProvinceName()}
              </Badge>
            </div>
          </div>
        )}

        {/* Procuring Entity */}
        {tender.procuringEntity?.name && tender.procuringEntity.name !== buyer?.name && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
            <span className="truncate">Procuring Entity: {tender.procuringEntity.name}</span>
          </div>
        )}

        {/* Value */}
        {tender.value?.amount && (
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-success shrink-0" />
            <span className="font-semibold text-success truncate">
              {TenderApiService.formatCurrency(tender.value.amount, tender.value.currency)}
            </span>
          </div>
        )}

        {/* Tender Period */}
        {tender.tenderPeriod && (
          <div className="space-y-2">
            {tender.tenderPeriod.startDate && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                <span className="truncate">Opens: {TenderApiService.formatDate(tender.tenderPeriod.startDate)}</span>
              </div>
            )}
            {tender.tenderPeriod.endDate && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-warning shrink-0" />
                <span className="truncate">Closes: {TenderApiService.formatDate(tender.tenderPeriod.endDate)}</span>
              </div>
            )}
          </div>
        )}

        {/* Documents Count */}
        {tender.documents && tender.documents.length > 0 && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
            <span>{tender.documents.length} document{tender.documents.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* OCID */}
        {release.ocid && (
          <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1.5 rounded truncate">
            OCID: {release.ocid}
          </div>
        )}

        <Button 
          onClick={handleViewDetails}
          className="w-full mt-4 h-10 sm:h-9 hover-scale"
          variant="outline"
        >
          <span className="text-sm font-medium">View Details</span>
        </Button>
      </CardContent>
    </Card>
  );
}