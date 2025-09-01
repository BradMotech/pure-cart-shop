import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

interface ProductFiltersProps {
  products: Product[];
  onFilter: (filteredProducts: Product[]) => void;
}

export const ProductFilters = ({ products, onFilter }: ProductFiltersProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    filtered = filtered.filter(
      p => p.price >= priceRange.min && p.price <= priceRange.max
    );

    onFilter(filtered);
  }, [selectedCategory, priceRange, products, onFilter]);

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setPriceRange({ min: 0, max: 1000 });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-foreground">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Category</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Price Range</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <input
                type="number"
                placeholder="Min"
                className="w-full px-2 py-2 border border-border rounded text-xs bg-background text-foreground placeholder:text-muted-foreground"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))
                }
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full px-2 py-2 border border-border rounded text-xs bg-background text-foreground placeholder:text-muted-foreground"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))
                }
              />
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-foreground"
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
};