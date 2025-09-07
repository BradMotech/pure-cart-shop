import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import CartSidebar from '@/components/CartSidebar';
import Loader from '@/components/Loader';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    { id: 'tops', name: 'Tops', count: products.filter(p => p.category?.toLowerCase().includes('shirt') || p.category?.toLowerCase() === 'tops').length },
    { id: 'headwear', name: 'Headwear', count: products.filter(p => p.category?.toLowerCase() === 'headwear').length },
    { id: 'bottoms', name: 'Bottoms', count: products.filter(p => p.category?.toLowerCase() === 'bottoms').length },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(50);
      
      if (error) {
        console.error('Supabase error:', error);
        setProducts([]);
        return;
      }
      
      // Transform data to match Product interface
      const transformedProducts = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        price: product.price,
        original_price: product.original_price || undefined,
        category: product.category,
        gender: product.gender,
        colors: product.colors || [],
        sizes: product.sizes || [],
        image_url: product.image_url || undefined,
        in_stock: product.in_stock ?? true,
        is_on_sale: product.is_on_sale ?? false,
        created_at: product.created_at || undefined,
        updated_at: product.updated_at || undefined
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'tops') return product.category?.toLowerCase().includes('shirt') || product.category?.toLowerCase() === 'tops';
      if (selectedCategory === 'bottoms') return product.category?.toLowerCase() === 'bottoms';
      if (selectedCategory === 'headwear') return product.category?.toLowerCase() === 'headwear';
      return product.category?.toLowerCase() === selectedCategory;
    })
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
                <div className="space-y-4">
                  <p className="text-gray-600">No products found.</p>
                  <p className="text-sm text-gray-500">Make sure you have products in your Supabase database.</p>
                  <Button 
                    onClick={() => window.location.href = '/admin'}
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white"
                  >
                    Add Products (Admin)
                  </Button>
                </div>
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