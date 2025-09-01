export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  gender: string;
  image_url?: string;
  colors: string[];
  sizes: string[];
  in_stock: boolean;
  is_on_sale: boolean;
  created_at?: string;
  updated_at?: string;
}