import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import CartSidebar from '@/components/CartSidebar';
import Loader from '@/components/Loader';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    { id: 'tops', name: 'Tops', count: products.filter(p => p.category === 'Tops').length },
    { id: 'headwear', name: 'Headwear', count: products.filter(p => p.category === 'Headwear').length },
    { id: 'bottoms', name: 'Bottoms', count: products.filter(p => p.category === 'Bottoms').length },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Transform data to match Product interface
      const transformedProducts = (data || []).map(product => ({
        ...product,
        colors: product.colors || [],
        sizes: product.sizes || [],
        in_stock: product.in_stock ?? true,
        is_on_sale: product.is_on_sale ?? false,
        description: product.description || undefined,
        image_url: product.image_url || undefined,
        original_price: product.original_price || undefined
      }));
      
      console.log('Transformed products:', transformedProducts);
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => 
      selectedCategory === 'all' || 
      product.category.toLowerCase() === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {loading ? (
          <Loader size="lg" text="Loading products..." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-shop-text-light">No products found in this category.</p>
              </div>
            )}
          </>
        )}
      </main>

      <CartSidebar />
    </div>
  );
};

export default Index;
