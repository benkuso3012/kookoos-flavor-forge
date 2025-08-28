
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Star, Clock, Flame, Leaf } from "lucide-react";

interface MenuFiltersProps {
  onFilterChange: (filters: MenuFilter) => void;
  categories: Array<{ id: string; name: string; }>;
}

export interface MenuFilter {
  search: string;
  category: string;
  dietary: string[];
  priceRange: [number, number];
  sortBy: string;
}

const MenuFilters = ({ onFilterChange, categories }: MenuFiltersProps) => {
  const [filters, setFilters] = useState<MenuFilter>({
    search: "",
    category: "all",
    dietary: [],
    priceRange: [0, 50],
    sortBy: "popular"
  });

  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (newFilters: Partial<MenuFilter>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const toggleDietary = (dietary: string) => {
    const newDietary = filters.dietary.includes(dietary)
      ? filters.dietary.filter(d => d !== dietary)
      : [...filters.dietary, dietary];
    updateFilters({ dietary: newDietary });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search menu items..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
        </Button>
        
        {["spicy", "vegetarian", "vegan", "gluten_free"].map((dietary) => (
          <Badge
            key={dietary}
            variant={filters.dietary.includes(dietary) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleDietary(dietary)}
          >
            {dietary === "spicy" && <Flame className="h-3 w-3 mr-1" />}
            {dietary === "vegetarian" && <Leaf className="h-3 w-3 mr-1" />}
            {dietary === "vegan" && <Leaf className="h-3 w-3 mr-1" />}
            {dietary.replace("_", " ")}
          </Badge>
        ))}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Categories */}
            <div>
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={filters.category === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => updateFilters({ category: "all" })}
                >
                  All
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={filters.category === category.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => updateFilters({ category: category.id })}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="font-medium mb-2">Sort By</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "popular", label: "Popular", icon: Star },
                  { key: "price_low", label: "Price: Low to High", icon: null },
                  { key: "price_high", label: "Price: High to Low", icon: null },
                  { key: "prep_time", label: "Prep Time", icon: Clock }
                ].map(({ key, label, icon: Icon }) => (
                  <Badge
                    key={key}
                    variant={filters.sortBy === key ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => updateFilters({ sortBy: key })}
                  >
                    {Icon && <Icon className="h-3 w-3 mr-1" />}
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MenuFilters;
