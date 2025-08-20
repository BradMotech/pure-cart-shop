const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error' };
    }
  }

  // Auth methods
  async signUp(email: string, password: string, fullName?: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    if (result.data) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async signIn(email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.data) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  async updateProfile(data: { full_name?: string }) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  signOut() {
    this.removeToken();
  }

  // Products methods
  async getProducts() {
    return this.request<any[]>('/products');
  }

  async createProduct(productData: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string) {
    return this.request<any>(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Wishlist methods
  async getWishlist() {
    return this.request<any[]>('/wishlist');
  }

  async addToWishlist(productId: string) {
    return this.request<any>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  async removeFromWishlist(wishlistId: string) {
    return this.request<any>(`/wishlist/${wishlistId}`, {
      method: 'DELETE',
    });
  }

  // Orders methods
  async getOrders() {
    return this.request<any[]>('/orders');
  }

  async createOrder(orderData: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}

export const apiClient = new ApiClient();