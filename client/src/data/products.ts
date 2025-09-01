import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "1",
    name: "Classic Cotton T-Shirt",
    price: 199,
    category: "Tops",
    gender: "Unisex",
    image_url: "/src/assets/product-1.jpg",
    colors: ["Black", "White", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    in_stock: true,
    is_on_sale: false,
    description: "Comfortable classic cotton t-shirt perfect for everyday wear."
  },
  {
    id: "2", 
    name: "Urban Hoodie",
    price: 399,
    category: "Tops",
    gender: "Unisex",
    image_url: "/src/assets/product-2.jpg",
    colors: ["Black", "Navy", "Charcoal"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    in_stock: true,
    is_on_sale: false,
    description: "Cozy urban hoodie with modern fit and premium materials."
  },
  {
    id: "3",
    name: "Baseball Cap",
    price: 149,
    category: "Headwear",
    gender: "Unisex", 
    image_url: "/src/assets/product-3.jpg",
    colors: ["Black", "White", "Red"],
    sizes: ["One Size"],
    in_stock: true,
    is_on_sale: false,
    description: "Classic baseball cap with adjustable strap."
  },
  {
    id: "4",
    name: "Denim Jeans",
    price: 599,
    category: "Bottoms",
    gender: "Men",
    image_url: "/src/assets/product-4.jpg", 
    colors: ["Blue", "Black", "Light Blue"],
    sizes: ["28", "30", "32", "34", "36"],
    in_stock: true,
    is_on_sale: false,
    description: "Premium denim jeans with comfortable fit."
  },
  {
    id: "5",
    name: "Polo Shirt",
    price: 299,
    category: "Tops",
    gender: "Men",
    image_url: "/src/assets/product-5.jpg",
    colors: ["White", "Black", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    in_stock: true,
    is_on_sale: false,
    description: "Classic polo shirt for smart casual occasions."
  },
  {
    id: "6",
    name: "Cargo Shorts",
    price: 349,
    category: "Bottoms",
    gender: "Men",
    image_url: "/src/assets/product-6.jpg",
    colors: ["Khaki", "Black", "Olive"],
    sizes: ["S", "M", "L", "XL"],
    in_stock: true,
    is_on_sale: false,
    description: "Functional cargo shorts with multiple pockets."
  }
];