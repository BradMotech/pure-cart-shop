export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  gender: string;
  colors?: string[];
  sizes?: string[];
  image_url?: string;
  in_stock: boolean;
  is_on_sale?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}