import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Products = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const resolveImageUrl = (image_url: string | null) => {
    if (image_url && image_url.startsWith("http")) return image_url;
    if (image_url) {
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(image_url);
      return data.publicUrl;
    }
    return "/placeholder.svg";
  };

  const { data: dbProducts = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,price,category,image_url,colors,sizes,description"
        );
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        category: p.category ?? "Uncategorized",
        image: resolveImageUrl(p.image_url),
        colors: (p.colors as string[] | null) ?? [],
        sizes: (p.sizes as string[] | null) ?? [],
        description: p.description ?? "",
      })) as Product[];
    },
  });

  useEffect(() => {
    setFilteredProducts(dbProducts);
  }, [dbProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            All Products
          </h1>
          <p className="text-muted-foreground text-lg">
            Browse our complete collection of premium apparel
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <ProductFilters 
              products={dbProducts}
              onFilter={setFilteredProducts}
            />
          </aside>

          <section className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No products found matching your filters.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Products;