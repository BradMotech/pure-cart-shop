import { ReleasePackage } from '@/types/tender';
import { supabase } from '@/integrations/supabase/client';

const BASE_URL = 'https://ocds-api.etenders.gov.za';

export class TenderApiService {
  
  static async getAllTenders(page?: number, pageSize?: number): Promise<ReleasePackage> {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageSize) params.append('pageSize', pageSize.toString());
      
      const queryParams = new URLSearchParams({
        path: '/api/OCDSReleases',
        ...(params.toString() && { params: params.toString() })
      });

      const response = await fetch(`https://attqsvaofnoctctqumvc.supabase.co/functions/v1/etenders-proxy?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dHFzdmFvZm5vY3RjdHF1bXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzE2MzAsImV4cCI6MjA2ODAwNzYzMH0.Ms05gNU-0Ulimuk0V0_o_ksXY58nYrXGbgMOI-bkJn8`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dHFzdmFvZm5vY3RjdHF1bXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzE2MzAsImV4cCI6MjA2ODAwNzYzMH0.Ms05gNU-0Ulimuk0V0_o_ksXY58nYrXGbgMOI-bkJn8',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch tenders: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching tenders:', error);
      throw error;
    }
  }

  static async getTenderByOcid(ocid: string): Promise<ReleasePackage> {
    try {
      const queryParams = new URLSearchParams({
        path: `/api/OCDSReleases/release/${encodeURIComponent(ocid)}`
      });

      const response = await fetch(`https://attqsvaofnoctctqumvc.supabase.co/functions/v1/etenders-proxy?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dHFzdmFvZm5vY3RjdHF1bXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzE2MzAsImV4cCI6MjA2ODAwNzYzMH0.Ms05gNU-0Ulimuk0V0_o_ksXY58nYrXGbgMOI-bkJn8`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dHFzdmFvZm5vY3RjdHF1bXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzE2MzAsImV4cCI6MjA2ODAwNzYzMH0.Ms05gNU-0Ulimuk0V0_o_ksXY58nYrXGbgMOI-bkJn8',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch tender: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching tender by OCID:', error);
      throw error;
    }
  }

  static formatCurrency(amount: number, currency: string | null): string {
    const currencyCode = currency || 'ZAR';
    
    try {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      // Fallback for unsupported currencies
      return `${currencyCode} ${amount.toLocaleString()}`;
    }
  }

  static formatDate(dateString: string | null): string {
    if (!dateString) return 'Not specified';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  static getStatusBadgeVariant(status: string | null): 'default' | 'success' | 'warning' | 'destructive' {
    if (!status) return 'default';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('active') || statusLower.includes('open')) return 'success';
    if (statusLower.includes('closed') || statusLower.includes('complete')) return 'default';
    if (statusLower.includes('cancelled') || statusLower.includes('withdrawn')) return 'destructive';
    if (statusLower.includes('planning') || statusLower.includes('pending')) return 'warning';
    
    return 'default';
  }
}