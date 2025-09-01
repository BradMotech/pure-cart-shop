import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "1",
    name: "Classic Cotton T-Shirt",
    price: 199,
    category: "Tops",
    image: "/src/assets/product-1.jpg",
    colors: ["Black", "White", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Comfortable classic cotton t-shirt perfect for everyday wear."
  },
  {
    id: "2", 
    name: "Urban Hoodie",
    price: 399,
    category: "Tops",
    image: "/src/assets/product-2.jpg",
    colors: ["Black", "Navy", "Charcoal"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Cozy urban hoodie with modern fit and premium materials."
  },
  {
    id: "3",
    name: "Baseball Cap",
    price: 149,
    category: "Headwear", 
    image: "/src/assets/product-3.jpg",
    colors: ["Black", "White", "Red"],
    sizes: ["One Size"],
    description: "Classic baseball cap with adjustable strap."
  },
  {
    id: "4",
    name: "Denim Jeans",
    price: 599,
    category: "Bottoms",
    image: "/src/assets/product-4.jpg", 
    colors: ["Blue", "Black", "Light Blue"],
    sizes: ["28", "30", "32", "34", "36"],
    description: "Premium denim jeans with comfortable fit."
  },
  {
    id: "5",
    name: "Polo Shirt",
    price: 299,
    category: "Tops",
    image: "/src/assets/product-5.jpg",
    colors: ["White", "Black", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    description: "Classic polo shirt for smart casual occasions."
  },
  {
    id: "6",
    name: "Cargo Shorts",
    price: 349,
    category: "Bottoms",
    image: "/src/assets/product-6.jpg",
    colors: ["Khaki", "Black", "Olive"],
    sizes: ["S", "M", "L", "XL"],
    description: "Functional cargo shorts with multiple pockets."
  }
];