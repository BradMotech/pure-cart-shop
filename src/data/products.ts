import { Product } from '@/types/product';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';
import product6 from '@/assets/product-6.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Black Sleeveless',
    price: 75,
    image_url: '/src/assets/product-1.jpg',
    category: 'Tops',
    gender: 'Unisex',
    colors: ['black', 'white', 'grey'],
    in_stock: true,
    description: 'Essential sleeveless top made from premium cotton blend'
  },
  {
    id: '2',
    name: 'Classic White T-shirt',
    price: 75,
    original_price: 94,
    image_url: '/src/assets/product-2.jpg',
    category: 'Tops',
    gender: 'Unisex',
    colors: ['white', 'black'],
    in_stock: true,
    is_on_sale: true,
    description: 'Premium white cotton t-shirt with relaxed fit'
  },
  {
    id: '3',
    name: 'Half Sleeve T-shirts',
    price: 55,
    image_url: '/src/assets/product-3.jpg',
    category: 'Tops',
    gender: 'Unisex',
    colors: ['red', 'green', 'blue', 'orange'],
    in_stock: true,
    description: 'Colorful collection of comfortable half sleeve shirts'
  },
  {
    id: '4',
    name: 'Modern T-shirts',
    price: 117,
    original_price: 146,
    image_url: '/src/assets/product-4.jpg',
    category: 'Tops',
    gender: 'Unisex',
    colors: ['white', 'black'],
    in_stock: true,
    is_on_sale: true,
    description: 'Modern fit t-shirts perfect for casual occasions'
  },
  {
    id: '5',
    name: 'Casual Beige Set',
    price: 95,
    original_price: 119,
    image_url: '/src/assets/product-5.jpg',
    category: 'Tops',
    gender: 'Unisex',
    colors: ['beige', 'white'],
    in_stock: true,
    is_on_sale: true,
    description: 'Comfortable casual wear set for everyday style'
  },
  {
    id: '6',
    name: 'Premium Black Tee',
    price: 85,
    image_url: '/src/assets/product-6.jpg',
    category: 'Tops',
    gender: 'Unisex',
    colors: ['black', 'white', 'grey'],
    in_stock: true,
    description: 'Premium quality black t-shirt with superior comfort'
  }
];

export const categories = [
  { id: 'all', name: 'All products', count: products.length },
  { id: 'men', name: 'Men', count: products.filter(p => p.category === 'Men').length },
  { id: 'women', name: 'Women', count: products.filter(p => p.category === 'Women').length },
];