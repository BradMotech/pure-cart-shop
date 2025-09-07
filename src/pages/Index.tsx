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
      console.log('🔄 Starting to fetch products from Supabase...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(50);
      
      console.log('📦 Raw Supabase response:', { 
        data, 
        error, 
        dataType: typeof data,
        isArray: Array.isArray(data),
        count: data?.length 
      });
      
      if (error) {
        console.error('❌ Supabase error details:', error);
        setProducts([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ No products found in database');
        setProducts([]);
        return;
      }
      
      console.log('🔍 First product example:', data[0]);
      
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
      
      console.log('✅ Transformed products:', {
        count: transformedProducts.length,
        products: transformedProducts,
        firstProduct: transformedProducts[0]
      });
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('💥 Catch block error:', error);
      setProducts([]);
    } finally {
      console.log('🏁 Fetch products completed, setting loading to false');
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            // Show skeleton cards while loading
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-64 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
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
      </main>

      <CartSidebar />
    </div>
  );
};

export default Index;