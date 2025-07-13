import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface InternalPDFViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
  documentType?: string;
  format?: string;
}

function getFileExtension(url: string): string {
  const urlObj = new URL(url);
  const path = urlObj.pathname || urlObj.searchParams.get('downloadedFileName') || '';
  const extension = path.split('.').pop()?.toLowerCase() || '';
  return extension;
}

function isViewableInBrowser(url: string, format?: string): boolean {
  const extension = getFileExtension(url);
  const fileFormat = format?.toLowerCase() || extension;
  
  // Only PDFs can be viewed inline with our current setup
  return fileFormat === 'pdf' || extension === 'pdf';
}

export function InternalPDFViewer({ url, title, onClose, documentType, format }: InternalPDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [zoom, setZoom] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const { toast } = useToast();

  // Check if this document can be viewed inline
  const canViewInline = isViewableInBrowser(url, format);
  const fileExtension = getFileExtension(url);
  
  // Try direct URL first, fallback to proxy if CORS issues
  const [useProxy, setUseProxy] = useState(false);
  const pdfUrl = useProxy 
    ? `https://attqsvaofnoctctqumvc.supabase.co/functions/v1/pdf-proxy?url=${encodeURIComponent(url)}` 
    : url;

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  // For non-PDF files, show fallback immediately
  useState(() => {
    if (!canViewInline) {
      setLoading(false);
      setPdfError(true);
    }
  });

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF loading error:', error);
    
    // If not using proxy yet, try with proxy
    if (!useProxy) {
      console.log('Trying with proxy...');
      setUseProxy(true);
      setLoading(true);
      setPdfError(false);
      return;
    }
    
    // If proxy also failed, show error
    setLoading(false);
    setPdfError(true);
    toast({
      title: "PDF Loading Error",
      description: "Could not load the PDF document. Showing fallback options.",
      variant: "destructive",
    });
  }, [useProxy, toast]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = useProxy ? pdfUrl : url;
      link.download = title || 'document.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Your document download has started.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the document. Try opening it in a new tab.",
        variant: "destructive",
      });
    }
  };

  const handleOpenInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4'
      }`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card 
        className={`w-full ${
          isFullscreen 
            ? 'max-w-none max-h-none h-screen rounded-none' 
            : 'max-w-6xl max-h-[95vh] sm:max-h-[90vh]'
        } flex flex-col`}
      >
        <CardHeader className="shrink-0 pb-3 px-3 sm:px-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-lg truncate">
                {title || 'Document Viewer'}
              </CardTitle>
              <div className="hidden sm:flex gap-2">
                {documentType && (
                  <Badge variant="outline" className="text-xs">
                    {documentType}
                  </Badge>
                )}
                {format && (
                  <Badge variant="outline" className="text-xs">
                    {format}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Page Navigation */}
              {numPages > 0 && (
                <div className="flex items-center gap-1 border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <span className="text-xs font-mono px-1 sm:px-2 border-x min-w-[60px] sm:min-w-[80px] text-center">
                    {pageNumber} / {numPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.25}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-xs font-mono px-1 sm:px-2 border-x min-w-[50px] sm:min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3.0}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>

              {/* Action Buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="Download"
              >
                <Download className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInNewTab}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="Open in New Tab"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-3 sm:p-6 overflow-auto">
          <div className="w-full h-full flex items-center justify-center">
            {loading && !pdfError && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
              </div>
            )}

            {pdfError ? (
              <div className="text-center space-y-4 max-w-md p-6">
                <div className="text-4xl sm:text-6xl">
                  {fileExtension === 'doc' || fileExtension === 'docx' ? '📄' : 
                   fileExtension === 'xls' || fileExtension === 'xlsx' ? '📊' : 
                   fileExtension === 'ppt' || fileExtension === 'pptx' ? '📽️' : '📄'}
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-sm sm:text-base">
                    {fileExtension.toUpperCase()} Document
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    {title || 'Government tender document'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button variant="default" size="sm" onClick={handleOpenInNewTab}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open Document
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {canViewInline 
                      ? "Unable to display PDF inline. Use the buttons above to view or download."
                      : `This ${fileExtension.toUpperCase()} document cannot be displayed inline. Download it to view with the appropriate application.`
                    }
                  </p>
                </div>
              </div>
            ) : (
              canViewInline ? (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading=""
                  className="flex justify-center"
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={zoom}
                    className="shadow-lg"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              ) : null
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}