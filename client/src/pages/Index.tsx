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
      
      // Check if we can connect to Supabase first
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(50);

      console.log('Supabase response:', { data, error, count: data?.length });
      
      if (error) {
        console.error('Supabase error details:', error);
        // If the table doesn't exist or we have no access, show empty state
        setProducts([]);
        setLoading(false);
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
      
      console.log('Transformed products:', transformedProducts.length, 'products');
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // Set empty array on error
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
