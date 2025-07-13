import { useState } from 'react';
import { ArrowLeft, Calendar, Building2, MapPin, FileText, DollarSign, Clock, Globe, Phone, Mail, Download, ExternalLink, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Release } from '@/types/tender';
import { TenderApiService } from '@/services/tenderApi';
import { PDFViewer } from '@/components/PDFViewer';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tenders
        </Button>
        
        <div className="w-full">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {tender.title || 'Untitled Tender'}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant={TenderApiService.getStatusBadgeVariant(tender.status)}>
              {tender.status || 'Unknown'}
            </Badge>
            {tender.mainProcurementCategory && (
              <Badge variant="outline">
                {tender.mainProcurementCategory}
              </Badge>
            )}
            {release.ocid && (
              <Badge variant="secondary" className="font-mono text-xs">
                {release.ocid}
              </Badge>
            )}
          </div>
          
          {tender.description && (
            <p className="text-muted-foreground leading-relaxed">
              {tender.description}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Key Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Value */}
                {tender.value?.amount && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-semibold text-success text-lg">
                        {TenderApiService.formatCurrency(tender.value.amount, tender.value.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">Estimated Value</p>
                    </div>
                  </div>
                )}

                {/* Procurement Method */}
                {tender.procurementMethod && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{tender.procurementMethod}</p>
                      <p className="text-sm text-muted-foreground">Procurement Method</p>
                    </div>
                  </div>
                )}

                {/* Categories */}
                {tender.additionalProcurementCategories && tender.additionalProcurementCategories.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Additional Categories</p>
                    <div className="flex flex-wrap gap-1">
                      {tender.additionalProcurementCategories.map((category, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Classification */}
                {tender.classification && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Classification</p>
                    <p className="font-medium">{tender.classification.description}</p>
                    {tender.classification.id && (
                      <p className="text-xs text-muted-foreground">ID: {tender.classification.id}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organizations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organizations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Buyer */}
                {buyer?.name && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{buyer.name}</p>
                      <p className="text-sm text-muted-foreground">Buyer</p>
                    </div>
                  </div>
                )}

                {/* Procuring Entity */}
                {tender.procuringEntity?.name && tender.procuringEntity.name !== buyer?.name && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{tender.procuringEntity.name}</p>
                      <p className="text-sm text-muted-foreground">Procuring Entity</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Important Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Tender Period */}
                  {tender.tenderPeriod && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Tender Period</h4>
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

                  {/* Enquiry Period */}
                  {tender.enquiryPeriod && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Enquiry Period</h4>
                      {tender.enquiryPeriod.startDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>From: {TenderApiService.formatDate(tender.enquiryPeriod.startDate)}</span>
                        </div>
                      )}
                      {tender.enquiryPeriod.endDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-warning" />
                          <span>Until: {TenderApiService.formatDate(tender.enquiryPeriod.endDate)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          {(tender.eligibilityCriteria || tender.submissionMethodDetails || tender.procurementMethodDetails) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tender.eligibilityCriteria && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Eligibility Criteria</h4>
                    <p className="text-sm text-muted-foreground">{tender.eligibilityCriteria}</p>
                  </div>
                )}
                
                {tender.submissionMethodDetails && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Submission Method Details</h4>
                    <p className="text-sm text-muted-foreground">{tender.submissionMethodDetails}</p>
                  </div>
                )}
                
                {tender.procurementMethodDetails && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Procurement Method Details</h4>
                    <p className="text-sm text-muted-foreground">{tender.procurementMethodDetails}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {tender.documents && tender.documents.length > 0 ? (
            <div className="grid gap-4">
              {tender.documents.map((doc, index) => (
                <Card key={doc.id || index}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{doc.title || 'Untitled Document'}</h4>
                          {doc.description && (
                            <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {doc.documentType && <Badge variant="outline">{doc.documentType}</Badge>}
                            {doc.format && <Badge variant="outline">{doc.format}</Badge>}
                            {doc.datePublished && <span>Published: {TenderApiService.formatDate(doc.datePublished)}</span>}
                          </div>
                        </div>
                      </div>
                      {doc.url && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <Button
                            variant="default"
                            onClick={() => handleViewDocument(doc)}
                            className="flex-1 sm:flex-none"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View in App
                          </Button>
                          <Button
                            variant="outline"
                            asChild
                            className="flex-1 sm:flex-none"
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
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No documents available for this tender.</p>
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

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tender Timeline</CardTitle>
              <CardDescription>Key dates and milestones for this procurement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Release Date */}
                {release.date && (
                  <div className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Tender Released</p>
                      <p className="text-sm text-muted-foreground">{TenderApiService.formatDate(release.date)}</p>
                    </div>
                  </div>
                )}

                {/* Enquiry Period */}
                {tender.enquiryPeriod?.startDate && (
                  <div className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Enquiry Period Starts</p>
                      <p className="text-sm text-muted-foreground">{TenderApiService.formatDate(tender.enquiryPeriod.startDate)}</p>
                    </div>
                  </div>
                )}

                {/* Tender Period */}
                {tender.tenderPeriod?.startDate && (
                  <div className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Tender Opens</p>
                      <p className="text-sm text-muted-foreground">{TenderApiService.formatDate(tender.tenderPeriod.startDate)}</p>
                    </div>
                  </div>
                )}

                {/* Enquiry Period End */}
                {tender.enquiryPeriod?.endDate && (
                  <div className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                    <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Enquiry Period Ends</p>
                      <p className="text-sm text-muted-foreground">{TenderApiService.formatDate(tender.enquiryPeriod.endDate)}</p>
                    </div>
                  </div>
                )}

                {/* Tender Period End */}
                {tender.tenderPeriod?.endDate && (
                  <div className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Tender Closes</p>
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
        <PDFViewer
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