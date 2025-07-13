import { ReleasePackage } from '@/types/tender';

const BASE_URL = 'https://ocds-api.etenders.gov.za';

export class TenderApiService {
  
  static async getAllTenders(page?: number, pageSize?: number): Promise<ReleasePackage> {
    try {
      let url = `${BASE_URL}/api/OCDSReleases`;
      
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageSize) params.append('pageSize', pageSize.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tenders: ${response.status} ${response.statusText}`);
      }

      const data: ReleasePackage = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tenders:', error);
      throw error;
    }
  }

  static async getTenderByOcid(ocid: string): Promise<ReleasePackage> {
    try {
      const url = `${BASE_URL}/api/OCDSReleases/release/${encodeURIComponent(ocid)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tender: ${response.status} ${response.statusText}`);
      }

      const data: ReleasePackage = await response.json();
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