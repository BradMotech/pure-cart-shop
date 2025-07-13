import { ExternalLink, Mail, Phone, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Building className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base">eTenders Portal</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              The official platform for South African government procurement opportunities. 
              Promoting transparency and fair access to public contracts.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h3 className="font-semibold text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm">
                  Browse Tenders
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm">
                  Procurement Guidelines
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm">
                  Supplier Registration
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm">
                  Help & Support
                </Button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h3 className="font-semibold text-sm sm:text-base">Resources</h3>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
                  asChild
                >
                  <a href="https://ocds-api.etenders.gov.za/swagger/index.html" target="_blank" rel="noopener noreferrer">
                    API Documentation
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </li>
              <li>
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
                  asChild
                >
                  <a href="https://data.etenders.gov.za" target="_blank" rel="noopener noreferrer">
                    Transparency Portal
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm">
                  OCDS Standard
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm">
                  Privacy Policy
                </Button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h3 className="font-semibold text-sm sm:text-base">Contact</h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-muted-foreground justify-center sm:justify-start">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">support@etenders.gov.za</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground justify-center sm:justify-start">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span>+27 12 123 4567</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground justify-center sm:justify-start">
                <Building className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="text-center sm:text-left">Government Procurement Office</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        <div className="flex flex-col items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <p className="text-center">
            © {new Date().getFullYear()} Government of South Africa. All rights reserved.
          </p>
          <div className="flex items-center gap-2 sm:gap-4 text-center">
            <span>Powered by OCDS</span>
            <span>•</span>
            <Button 
              variant="link" 
              className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
              asChild
            >
              <a href="https://opendatacommons.org/licenses/pddl/1-0/" target="_blank" rel="noopener noreferrer">
                Open Data License
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}