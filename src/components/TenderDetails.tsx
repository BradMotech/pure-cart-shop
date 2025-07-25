import { useState } from 'react';
import { ArrowLeft, Calendar, Building2, MapPin, FileText, DollarSign, Clock, Globe, Phone, Mail, Download, ExternalLink, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Release } from '@/types/tender';
import { TenderApiService } from '@/services/tenderApi';
import { InternalPDFViewer } from '@/components/InternalPDFViewer';

interface TenderDetailsProps {
  release: Release;
  onBack: () => void;
}

export function TenderDetails({ release, onBack }: TenderDetailsProps) {
  const [viewingDocument, setViewingDocument] = useState<{
    url: string;
    title: string;
    documentType?: string;
    format?: string;
  } | null>(null);
  
  const tender = release.tender;
  const buyer = release.buyer;
  const awards = release.awards;
  
  if (!tender) return null;

  const handleViewDocument = (doc: any) => {
    setViewingDocument({
      url: doc.url,
      title: doc.title || 'Untitled Document',
      documentType: doc.documentType || undefined,
      format: doc.format || undefined,
    });
  };

  const handleCloseViewer = () => {
    setViewingDocument(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Modern Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-subtle border border-border/50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-primary opacity-[0.03]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
        
        <div className="relative p-6 md:p-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-6 hover:bg-background/80 backdrop-blur-sm border border-border/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenders
          </Button>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {tender.title || 'Untitled Tender'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge 
                  variant={TenderApiService.getStatusBadgeVariant(tender.status)}
                  className="px-4 py-2 text-sm font-semibold rounded-full"
                >
                  {tender.status || 'Unknown'}
                </Badge>
                {tender.mainProcurementCategory && (
                  <Badge className="px-4 py-2 text-sm font-semibold rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    {tender.mainProcurementCategory}
                  </Badge>
                )}
                {release.ocid && (
                  <Badge variant="secondary" className="px-4 py-2 text-xs font-mono rounded-full">
                    {release.ocid}
                  </Badge>
                )}
              </div>
            </div>
            
            {tender.description && (
              <div className="bg-background/60 backdrop-blur-sm rounded-xl p-6 border border-border/50">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {tender.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Key Information */}
            <Card className="relative overflow-hidden bg-gradient-subtle border-0 shadow-card hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  Key Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Value Highlight */}
                {tender.value?.amount && (
                  <div className="relative p-4 bg-success/5 rounded-xl border border-success/20">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <DollarSign className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Estimated Value</p>
                        <p className="font-bold text-success text-2xl leading-tight">
                          {TenderApiService.formatCurrency(tender.value.amount, tender.value.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Procurement Method */}
                {tender.procurementMethod && (
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Procurement Method</p>
                      <p className="font-semibold text-foreground text-lg">{tender.procurementMethod}</p>
                    </div>
                  </div>
                )}

                {/* Categories */}
                {tender.additionalProcurementCategories && tender.additionalProcurementCategories.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Additional Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {tender.additionalProcurementCategories.map((category, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1 text-xs font-medium rounded-full border-primary/20 text-primary hover:bg-primary/10">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Classification */}
                {tender.classification && (
                  <div className="space-y-2 p-4 bg-muted/30 rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Classification</p>
                    <p className="font-semibold text-foreground">{tender.classification.description}</p>
                    {tender.classification.id && (
                      <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">ID: {tender.classification.id}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organizations */}
            <Card className="relative overflow-hidden bg-gradient-subtle border-0 shadow-card hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  Organizations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Buyer */}
                {buyer?.name && (
                  <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Buyer</p>
                      <p className="font-semibold text-foreground text-lg">{buyer.name}</p>
                    </div>
                  </div>
                )}

                {/* Procuring Entity */}
                {tender.procuringEntity?.name && tender.procuringEntity.name !== buyer?.name && (
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Procuring Entity</p>
                      <p className="font-semibold text-foreground text-lg">{tender.procuringEntity.name}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timeline Section - Full Width */}
          {tender.tenderPeriod && (
            <Card className="relative overflow-hidden bg-gradient-subtle border-0 shadow-card hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Tender Period */}
                  {tender.tenderPeriod && (
                    <div className="space-y-4 p-4 bg-success/5 rounded-xl border border-success/20">
                      <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tender Period</h4>
                      <div className="space-y-3">
                        {tender.tenderPeriod.startDate && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                              <Calendar className="h-4 w-4 text-success" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Opens</p>
                              <p className="font-semibold text-foreground">{TenderApiService.formatDate(tender.tenderPeriod.startDate)}</p>
                            </div>
                          </div>
                        )}
                        {tender.tenderPeriod.endDate && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                              <Clock className="h-4 w-4 text-warning" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Closes</p>
                              <p className="font-semibold text-foreground">{TenderApiService.formatDate(tender.tenderPeriod.endDate)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enquiry Period */}
                  {tender.enquiryPeriod && (
                    <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Enquiry Period</h4>
                      <div className="space-y-3">
                        {tender.enquiryPeriod.startDate && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">From</p>
                              <p className="font-semibold text-foreground">{TenderApiService.formatDate(tender.enquiryPeriod.startDate)}</p>
                            </div>
                          </div>
                        )}
                        {tender.enquiryPeriod.endDate && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                              <Clock className="h-4 w-4 text-warning" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Until</p>
                              <p className="font-semibold text-foreground">{TenderApiService.formatDate(tender.enquiryPeriod.endDate)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Details */}
          {(tender.eligibilityCriteria || tender.submissionMethodDetails || tender.procurementMethodDetails) && (
            <Card className="relative overflow-hidden bg-gradient-subtle border-0 shadow-card hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {tender.eligibilityCriteria && (
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Eligibility Criteria</h4>
                    <p className="text-sm text-foreground leading-relaxed">{tender.eligibilityCriteria}</p>
                  </div>
                )}
                
                {tender.submissionMethodDetails && (
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Submission Method Details</h4>
                    <p className="text-sm text-foreground leading-relaxed">{tender.submissionMethodDetails}</p>
                  </div>
                )}
                
                {tender.procurementMethodDetails && (
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Procurement Method Details</h4>
                    <p className="text-sm text-foreground leading-relaxed">{tender.procurementMethodDetails}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          {tender.documents && tender.documents.length > 0 ? (
            <div className="grid gap-6">
              {tender.documents.map((doc, index) => (
                <Card key={doc.id || index} className="relative overflow-hidden bg-gradient-subtle border-0 shadow-card hover:shadow-lg transition-all duration-300 group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <div>
                            <h4 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                              {doc.title || 'Untitled Document'}
                            </h4>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">{doc.description}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {doc.documentType && (
                              <Badge className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border-primary/20">
                                {doc.documentType}
                              </Badge>
                            )}
                            {doc.format && (
                              <Badge variant="outline" className="px-3 py-1 text-xs font-medium rounded-full border-success/20 text-success">
                                {doc.format}
                              </Badge>
                            )}
                            {doc.datePublished && (
                              <Badge variant="secondary" className="px-3 py-1 text-xs font-medium rounded-full">
                                Published: {TenderApiService.formatDate(doc.datePublished)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {doc.url && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button
                            onClick={() => handleViewDocument(doc)}
                            className="flex-1 sm:flex-none bg-gradient-primary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 border-0 font-semibold h-10"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View in App
                          </Button>
                          <Button
                            variant="outline"
                            asChild
                            className="flex-1 sm:flex-none border-primary/20 text-primary hover:bg-primary/10 h-10 font-semibold"
                          >
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in Tab
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="relative overflow-hidden bg-gradient-subtle border-0 shadow-card">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opacity-60" />
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">No documents available for this tender.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="awards" className="space-y-4">
          {awards && awards.length > 0 ? (
            <div className="grid gap-4">
              {awards.map((award, index) => (
                <Card key={award.id || index}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg">{award.title || `Award ${index + 1}`}</CardTitle>
                      <Badge variant={TenderApiService.getStatusBadgeVariant(award.status)}>
                        {award.status || 'Unknown'}
                      </Badge>
                    </div>
                    {award.description && (
                      <CardDescription>{award.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {award.value?.amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-success" />
                        <span className="font-semibold text-success">
                          {TenderApiService.formatCurrency(award.value.amount, award.value.currency)}
                        </span>
                      </div>
                    )}
                    
                    {award.suppliers && award.suppliers.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Suppliers</h4>
                        <div className="space-y-1">
                          {award.suppliers.map((supplier, idx) => (
                            <div key={supplier.id || idx} className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary" />
                              <span className="text-sm">{supplier.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No awards have been made for this tender yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card className="relative overflow-hidden bg-gradient-subtle border-0 shadow-card hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                Tender Timeline
              </CardTitle>
              <CardDescription className="text-base">Key dates and milestones for this procurement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Release Date */}
                {release.date && (
                  <div className="flex items-center gap-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="w-3 h-3 bg-primary rounded-full shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-lg">Tender Released</p>
                      <p className="text-sm text-muted-foreground">{TenderApiService.formatDate(release.date)}</p>
                    </div>
                  </div>
                )}

                {/* Enquiry Period Start */}
                {tender.enquiryPeriod?.startDate && (
                  <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-xl">
                    <div className="w-3 h-3 bg-primary rounded-full shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-lg">Enquiry Period Starts</p>
                      <p className="text-sm text-muted-foreground">{TenderApiService.formatDate(tender.enquiryPeriod.startDate)}</p>
                    </div>
                  </div>
                )}

                {/* Tender Opens */}
                {tender.tenderPeriod?.startDate && (
                  <div className="flex items-center gap-6 p-4 bg-success/5 rounded-xl border border-success/20">
                    <div className="w-3 h-3 bg-success rounded-full shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-lg">Tender Opens</p>
                      <p className="text-sm text-muted-foreground">{TenderApiService.formatDate(tender.tenderPeriod.startDate)}</p>
                    </div>
                  </div>
                )}

                {/* Enquiry Period End */}
                {tender.enquiryPeriod?.endDate && (
                  <div className="flex items-center gap-6 p-4 bg-warning/5 rounded-xl border border-warning/20">
                    <div className="w-3 h-3 bg-warning rounded-full shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-lg">Enquiry Period Ends</p>
                      <p className="text-sm text-muted-foreground">{TenderApiService.formatDate(tender.enquiryPeriod.endDate)}</p>
                    </div>
                  </div>
                )}

                {/* Tender Closes */}
                {tender.tenderPeriod?.endDate && (
                  <div className="flex items-center gap-6 p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                    <div className="w-3 h-3 bg-destructive rounded-full shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-lg">Tender Closes</p>
                      <p className="text-sm text-muted-foreground">{TenderApiService.formatDate(tender.tenderPeriod.endDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PDF Viewer Modal */}
      {viewingDocument && (
        <InternalPDFViewer
          url={viewingDocument.url}
          title={viewingDocument.title}
          documentType={viewingDocument.documentType}
          format={viewingDocument.format}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
}