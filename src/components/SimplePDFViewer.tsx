import { useState } from 'react';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SimplePDFViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
  documentType?: string;
  format?: string;
}

export function SimplePDFViewer({ url, title, onClose, documentType, format }: SimplePDFViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = url;
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

        <CardContent className="flex-1 p-3 sm:p-6 overflow-hidden">
          <div className="w-full h-full bg-muted rounded-lg overflow-hidden">
            <iframe
              src={`https://attqsvaofnoctctqumvc.supabase.co/functions/v1/pdf-proxy?url=${encodeURIComponent(url)}`}
              className="w-full h-full border-0 rounded-lg"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                width: `${10000 / zoom}%`,
                height: `${10000 / zoom}%`
              }}
              title={title || 'PDF Document'}
              onError={() => {
                toast({
                  title: "PDF Loading Error",
                  description: "Could not load the PDF. Try opening it in a new tab.",
                  variant: "destructive",
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}