import { ExternalLink, Mail, Phone, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">eTenders Portal</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              The official platform for South African government procurement opportunities. 
              Promoting transparency and fair access to public contracts.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Browse Tenders
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Procurement Guidelines
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Supplier Registration
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Help & Support
                </Button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
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
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href="https://data.etenders.gov.za" target="_blank" rel="noopener noreferrer">
                    Transparency Portal
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  OCDS Standard
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@etenders.gov.za</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+27 12 123 4567</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>Government Procurement Office</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Government of South Africa. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Powered by OCDS</span>
            <span>•</span>
            <Button 
              variant="link" 
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
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