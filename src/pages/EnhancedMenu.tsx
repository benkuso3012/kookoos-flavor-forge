
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, ShoppingBag, Plus, Minus, Clock, Flame, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuFilters, { MenuFilter } from "@/components/MenuFilters";
import FavoritesButton from "@/components/FavoritesButton";
import LoyaltyCard from "@/components/LoyaltyCard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rating: number;
  is_spicy: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  calories: number;
  prep_time: number;
  category_id: string;
}

interface MenuCategory {
  id: string;
  name: string;
  description: string;
}

const EnhancedMenu = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    fetchMenuData();

    return () => subscription.unsubscribe();
  }, []);

  const fetchMenuData = async () => {
    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('menu_categories')
      .select('*')
      .order('sort_order');

    // Fetch menu items
    const { data: itemsData } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true);

    if (categoriesData) setCategories(categoriesData);
    if (itemsData) {
      setMenuItems(itemsData);
      setFilteredItems(itemsData);
    }
    
    setLoading(false);
  };

  const handleFilterChange = (filters: MenuFilter) => {
    let filtered = [...menuItems];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(item => item.category_id === filters.category);
    }

    // Dietary filters
    if (filters.dietary.includes("spicy")) {
      filtered = filtered.filter(item => item.is_spicy);
    }
    if (filters.dietary.includes("vegetarian")) {
      filtered = filtered.filter(item => item.is_vegetarian);
    }
    if (filters.dietary.includes("vegan")) {
      filtered = filtered.filter(item => item.is_vegan);
    }
    if (filters.dietary.includes("gluten_free")) {
      filtered = filtered.filter(item => item.is_gluten_free);
    }

    // Sort
    switch (filters.sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "prep_time":
        filtered.sort((a, b) => a.prep_time - b.prep_time);
        break;
      case "popular":
      default:
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredItems(filtered);
  };

  const addToCart = (itemId: string, itemName: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    toast({
      title: "Added to cart!",
      description: `${itemName} has been added to your cart.`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const proceedToCheckout = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to place an order",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (getTotalItems() === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart first",
        variant: "destructive",
      });
      return;
    }

    const cartItems = Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(item => item.id === itemId);
      return {
        id: itemId,
        name: item?.name || '',
        price: item?.price || 0,
        quantity
      };
    }).filter(item => item.quantity > 0);

    navigate("/checkout", { state: { cartItems } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading menu...</div>
        </main>
        <Footer />
      </div>
    );
  }

  const groupedItems = categories.map(category => ({
    ...category,
    items: filteredItems.filter(item => item.category_id === category.id)
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              FULL MENU
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Taste the <span className="text-primary">Bold</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our complete menu of bold Tanzanian flavors and street food favorites.
            </p>
          </div>

          {/* Loyalty Card */}
          {user && (
            <div className="mb-8">
              <LoyaltyCard user={user} />
            </div>
          )}

          {/* Filters */}
          <div className="mb-12">
            <MenuFilters 
              onFilterChange={handleFilterChange}
              categories={categories}
            />
          </div>

          {/* Menu Items by Category */}
          {groupedItems.map((category) => (
            <div key={category.id} className="mb-16">
              <h2 className="font-heading text-3xl font-bold text-foreground mb-8 text-center">
                {category.name}
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.items.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 border-0 shadow-card overflow-hidden"
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {item.is_spicy && (
                          <Badge className="bg-red-500 text-white font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            SPICY
                          </Badge>
                        )}
                        {item.is_vegetarian && (
                          <Badge className="bg-green-500 text-white font-bold flex items-center gap-1">
                            <Leaf className="w-3 h-3" />
                            VEG
                          </Badge>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold">{item.rating}</span>
                      </div>

                      {/* Favorites Button */}
                      <div className="absolute bottom-4 right-4">
                        <FavoritesButton itemId={item.id} user={user} />
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-heading text-xl font-bold mb-2">{item.name}</h3>
                      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                        {item.description}
                      </p>
                      
                      {/* Item Details */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-heading text-2xl font-bold text-primary">
                          ${item.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {item.prep_time}min
                          </span>
                          {item.calories && (
                            <span>{item.calories} cal</span>
                          )}
                        </div>
                      </div>

                      {/* Cart Controls */}
                      {cart[item.id] ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-bold text-lg">{cart[item.id]}</span>
                            <Button 
                              size="sm"
                              onClick={() => addToCart(item.id, item.name)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 font-bold group"
                          onClick={() => addToCart(item.id, item.name)}
                        >
                          ADD TO CART
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">No items found</h2>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more items
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-glow rounded-full px-6 py-6"
            onClick={proceedToCheckout}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Checkout ({getTotalItems()})
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EnhancedMenu;
