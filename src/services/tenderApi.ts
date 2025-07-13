import { ReleasePackage } from '@/types/tender';
import { supabase } from '@/integrations/supabase/client';

const BASE_URL = 'https://ocds-api.etenders.gov.za';

export class TenderApiService {
  
  static async getAllTenders(page?: number, pageSize?: number, province?: string): Promise<ReleasePackage> {
    try {
      const params = new URLSearchParams();
      if (page) params.append('PageNumber', page.toString());
      if (pageSize) params.append('PageSize', pageSize.toString());
      
      // Add required date parameters (last 3 months as default)
      const dateTo = new Date().toISOString().split('T')[0];
      const dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      params.append('dateFrom', dateFrom);
      params.append('dateTo', dateTo);
      
      // Add province filter if provided and not 'all-provinces'
      if (province && province !== 'all-provinces') {
        // Map province names to the format expected by the API
        const provinceMap: Record<string, string> = {
          'gauteng': 'Gauteng',
          'western-cape': 'Western Cape',
          'eastern-cape': 'Eastern Cape',
          'kwazulu-natal': 'KwaZulu-Natal',
          'limpopo': 'Limpopo',
          'mpumalanga': 'Mpumalanga',
          'northern-cape': 'Northern Cape',
          'north-west': 'North West',
          'free-state': 'Free State'
        };
        const mappedProvince = provinceMap[province];
        if (mappedProvince) {
          params.append('province', mappedProvince);
        }
      }
      
      const queryParams = new URLSearchParams({
        path: '/api/OCDSReleases',
        ...(params.toString() && { params: params.toString() })
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`https://attqsvaofnoctctqumvc.supabase.co/functions/v1/etenders-proxy?${queryParams}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dHFzdmFvZm5vY3RjdHF1bXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzE2MzAsImV4cCI6MjA2ODAwNzYzMH0.Ms05gNU-0Ulimuk0V0_o_ksXY58nYrXGbgMOI-bkJn8`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dHFzdmFvZm5vY3RjdHF1bXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzE2MzAsImV4cCI6MjA2ODAwNzYzMH0.Ms05gNU-0Ulimuk0V0_o_ksXY58nYrXGbgMOI-bkJn8',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch tenders: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching tenders:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  }

  static async getTenderByOcid(ocid: string): Promise<ReleasePackage> {
    try {
      const queryParams = new URLSearchParams({
        path: `/api/OCDSReleases/release/${encodeURIComponent(ocid)}`
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`https://attqsvaofnoctctqumvc.supabase.co/functions/v1/etenders-proxy?${queryParams}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dHFzdmFvZm5vY3RjdHF1bXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzE2MzAsImV4cCI6MjA2ODAwNzYzMH0.Ms05gNU-0Ulimuk0V0_o_ksXY58nYrXGbgMOI-bkJn8`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0dHFzdmFvZm5vY3RjdHF1bXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzE2MzAsImV4cCI6MjA2ODAwNzYzMH0.Ms05gNU-0Ulimuk0V0_o_ksXY58nYrXGbgMOI-bkJn8',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch tender: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Error fetching tender by OCID:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
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
