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
    <Card className="group h-full relative overflow-hidden bg-gradient-subtle border-0 shadow-card hover:shadow-lg transition-all duration-500 hover:-translate-y-2 animate-fade-in">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500" />
      
      {/* Modern accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative pb-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <CardTitle className="text-lg font-bold text-card-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
              {tender.title || 'Untitled Tender'}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                variant={TenderApiService.getStatusBadgeVariant(tender.status)} 
                className="text-xs font-medium px-3 py-1 rounded-full"
              >
                {tender.status || 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>
        
        {tender.description && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-3 mt-4 leading-relaxed">
            {tender.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="relative p-6 pt-2 space-y-4">
        
        {/* Key Information Section */}
        <div className="space-y-3">
          {/* Tender Number with modern styling */}
          {tender.id && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group-hover:bg-muted/50 transition-colors duration-300">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <Hash className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Tender Number</p>
                <p className="text-sm font-semibold text-foreground truncate">{tender.id}</p>
              </div>
            </div>
          )}

          {/* Value Highlight */}
          {tender.value?.amount && (
            <div className="flex items-center gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/10">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Contract Value</p>
                <p className="text-sm font-bold text-success truncate">
                  {TenderApiService.formatCurrency(tender.value.amount, tender.value.currency)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Organization & Location */}
        <div className="space-y-3">
          {buyer?.name && (
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Organ of State</p>
                <p className="text-sm font-medium text-foreground truncate">{buyer.name}</p>
              </div>
            </div>
          )}

          {tender.procuringEntity?.name && tender.procuringEntity.name !== buyer?.name && (
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Procuring Entity</p>
                <p className="text-sm font-medium text-foreground truncate">{tender.procuringEntity.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Badges Section */}
        <div className="flex flex-wrap gap-2">
          {tender.mainProcurementCategory && (
            <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20 text-xs font-medium px-3 py-1">
              {tender.mainProcurementCategory}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs font-medium px-3 py-1 border-primary/20 text-primary">
            <MapPin className="h-3 w-3 mr-1.5" />
            {getProvinceName()}
          </Badge>
        </div>

        {/* Timeline Section */}
        {tender.tenderPeriod && (
          <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Timeline</p>
            {tender.tenderPeriod.startDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Opens</p>
                  <p className="text-sm font-medium text-foreground">{TenderApiService.formatDate(tender.tenderPeriod.startDate)}</p>
                </div>
              </div>
            )}
            {tender.tenderPeriod.endDate && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-warning shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Closes</p>
                  <p className="text-sm font-medium text-foreground">{TenderApiService.formatDate(tender.tenderPeriod.endDate)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {tender.documents && tender.documents.length > 0 && (
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-primary" />
              <span>{tender.documents.length} document{tender.documents.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* OCID - Hidden until hover for cleaner look */}
        {release.ocid && (
          <div className="text-xs text-muted-foreground/60 font-mono bg-muted/20 px-3 py-2 rounded-md truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            OCID: {release.ocid}
          </div>
        )}

        {/* Modern CTA Button */}
        <Button 
          onClick={handleViewDetails}
          className="w-full mt-6 h-11 bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 border-0 font-semibold"
        >
          <span>View Details</span>
        </Button>
      </CardContent>
    </Card>
  );
}