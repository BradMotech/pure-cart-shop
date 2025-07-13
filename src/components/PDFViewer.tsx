import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PDFViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
  documentType?: string;
  format?: string;
}

export function PDFViewer({ url, title, onClose, documentType, format }: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load document. This may be due to CORS restrictions or the document may not be accessible.');
  };

  // Create a proxy URL for PDFs to handle CORS issues
  const getProxyUrl = (originalUrl: string) => {
    // If it's already a data URL or blob URL, use it directly
    if (originalUrl.startsWith('data:') || originalUrl.startsWith('blob:')) {
      return originalUrl;
    }
    
    // Use our Supabase edge function as PDF proxy
    const proxyBaseUrl = 'https://attqsvaofnoctctqumvc.supabase.co/functions/v1/pdf-proxy';
    return `${proxyBaseUrl}?url=${encodeURIComponent(originalUrl)}`;
  };

  const proxyUrl = getProxyUrl(url);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen, onClose]);

  // Check if the URL is likely a PDF
  const isPDF = url.toLowerCase().includes('.pdf') || format?.toLowerCase().includes('pdf');

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4'
      }`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card 
        ref={containerRef}
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
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 25}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="text-xs font-mono px-1 sm:px-2 border-x min-w-[40px] sm:min-w-[50px] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 300}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />

              {/* Action Buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:flex"
                title="Rotate"
              >
                <RotateCw className="h-3 w-3" />
              </Button>

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

        <CardContent className="flex-1 p-3 sm:p-6 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-32 sm:h-64">
              <div className="text-center space-y-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs sm:text-sm text-muted-foreground">Loading document...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-32 sm:h-64 p-4">
              <div className="text-center space-y-4 max-w-md">
                <div className="text-destructive text-2xl sm:text-4xl">⚠️</div>
                <div>
                  <h3 className="font-medium mb-2 text-sm sm:text-base">Cannot Display Document</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    This document cannot be displayed due to security restrictions. Government documents often block embedding for security reasons.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-3 w-3 mr-1" />
                      Download PDF
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open in New Tab
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!error && (
            <div 
              className="w-full h-full overflow-auto"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                width: `${10000 / zoom}%`,
                height: `${10000 / zoom}%`,
              }}
            >
              {isPDF ? (
                <iframe
                  ref={iframeRef}
                  src={`${proxyUrl}#view=FitH&toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title={title || 'PDF Document'}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              ) : (
                <iframe
                  ref={iframeRef}
                  src={proxyUrl}
                  className="w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title={title || 'Document'}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}