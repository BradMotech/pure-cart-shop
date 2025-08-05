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
    image: product1,
    rating: 5,
    reviewCount: 222,
    category: 'Women',
    colors: ['black', 'white', 'grey'],
    inStock: true,
    description: 'Essential sleeveless top made from premium cotton blend'
  },
  {
    id: '2',
    name: 'Classic White T-shirt',
    price: 75,
    originalPrice: 94,
    image: product2,
    rating: 4,
    reviewCount: 120,
    category: 'Men',
    colors: ['white', 'black'],
    inStock: true,
    isOnSale: true,
    description: 'Premium white cotton t-shirt with relaxed fit'
  },
  {
    id: '3',
    name: 'Half Sleeve T-shirts',
    price: 55,
    image: product3,
    rating: 4,
    reviewCount: 120,
    category: 'All',
    colors: ['red', 'green', 'blue', 'orange'],
    inStock: true,
    description: 'Colorful collection of comfortable half sleeve shirts'
  },
  {
    id: '4',
    name: 'Modern T-shirts',
    price: 117,
    originalPrice: 146,
    image: product4,
    rating: 5,
    reviewCount: 120,
    category: 'Men',
    colors: ['white', 'black'],
    inStock: true,
    isOnSale: true,
    description: 'Modern fit t-shirts perfect for casual occasions'
  },
  {
    id: '5',
    name: 'Casual Beige Set',
    price: 95,
    originalPrice: 119,
    image: product5,
    rating: 4,
    reviewCount: 89,
    category: 'Men',
    colors: ['beige', 'white'],
    inStock: true,
    isOnSale: true,
    description: 'Comfortable casual wear set for everyday style'
  },
  {
    id: '6',
    name: 'Premium Black Tee',
    price: 85,
    image: product6,
    rating: 5,
    reviewCount: 156,
    category: 'All',
    colors: ['black', 'white', 'grey'],
    inStock: true,
    description: 'Premium quality black t-shirt with superior comfort'
  }
];

export const categories = [
  { id: 'all', name: 'All products', count: products.length },
  { id: 'men', name: 'Men', count: products.filter(p => p.category === 'Men').length },
  { id: 'women', name: 'Women', count: products.filter(p => p.category === 'Women').length },
];