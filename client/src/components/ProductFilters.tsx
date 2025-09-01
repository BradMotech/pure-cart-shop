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
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Price Range</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full px-3 py-2 border rounded-md"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))
                }
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full px-3 py-2 border rounded-md"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))
                }
              />
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
};