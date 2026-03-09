import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, ShoppingBag, Plus, Minus, Clock, Flame, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuFilters, { MenuFilter } from "@/components/MenuFilters";
import FavoritesButton from "@/components/FavoritesButton";
import LoyaltyCard from "@/components/LoyaltyCard";
import { useCart } from "@/hooks/useCart";

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
  const { addItem: addToCartCtx, items: cartCtxItems, updateQuantity, totalItems: getTotalItems } = useCart();
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));

    fetchMenuData();
    return () => subscription.unsubscribe();
  }, []);

  const fetchMenuData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        (supabase as any).from("menu_categories").select("id, name, description").order("sort_order"),
        (supabase as any).from("menu_items").select("*").eq("is_available", true).order("rating", { ascending: false }),
      ]);

      if (catRes.data?.length) setCategories(catRes.data);
      if (itemRes.data?.length) {
        setMenuItems(itemRes.data);
        setFilteredItems(itemRes.data);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
    }
    setLoading(false);
  };

  const handleFilterChange = (filters: MenuFilter) => {
    let filtered = [...menuItems];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
    }
    if (filters.category !== "all") filtered = filtered.filter((item) => item.category_id === filters.category);
    if (filters.dietary.includes("spicy")) filtered = filtered.filter((item) => item.is_spicy);
    if (filters.dietary.includes("vegetarian")) filtered = filtered.filter((item) => item.is_vegetarian);
    if (filters.dietary.includes("vegan")) filtered = filtered.filter((item) => item.is_vegan);
    if (filters.dietary.includes("gluten_free")) filtered = filtered.filter((item) => item.is_gluten_free);

    switch (filters.sortBy) {
      case "price_low": filtered.sort((a, b) => a.price - b.price); break;
      case "price_high": filtered.sort((a, b) => b.price - a.price); break;
      case "prep_time": filtered.sort((a, b) => a.prep_time - b.prep_time); break;
      default: filtered.sort((a, b) => b.rating - a.rating);
    }
    setFilteredItems(filtered);
  };

  const addToCart = (item: MenuItem) => {
    addToCartCtx({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
    toast({ title: "Added to cart!", description: `${item.name} has been added to your cart.` });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const c = { ...prev };
      if (c[itemId] > 1) c[itemId]--;
      else delete c[itemId];
      return c;
    });
  };

  const getTotalItems = () => Object.values(cart).reduce((t, q) => t + q, 0);

  const proceedToCheckout = () => {
    if (!user) { toast({ title: "Sign in required", description: "Please sign in to place an order", variant: "destructive" }); navigate("/auth"); return; }
    if (getTotalItems() === 0) { toast({ title: "Empty cart", description: "Please add items to your cart first", variant: "destructive" }); return; }
    const cartItems = Object.entries(cart).map(([id, quantity]) => {
      const item = menuItems.find((i) => i.id === id);
      return { id, name: item?.name || "", price: item?.price || 0, quantity };
    }).filter((i) => i.quantity > 0);
    navigate("/checkout", { state: { cartItems } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const groupedItems = categories.map((c) => ({ ...c, items: filteredItems.filter((i) => i.category_id === c.id) })).filter((c) => c.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="mb-4 text-primary border-primary">FULL MENU</Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Taste the <span className="text-primary">Bold</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our complete menu of bold Tanzanian flavors and street food favorites.
            </p>
          </motion.div>

          {user && <div className="mb-8"><LoyaltyCard user={user} /></div>}

          <div className="mb-12">
            <MenuFilters onFilterChange={handleFilterChange} categories={categories} />
          </div>

          {groupedItems.map((category, ci) => (
            <div key={category.id} className="mb-16">
              <motion.h2
                className="font-heading text-3xl font-bold text-foreground mb-8 text-center"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                {category.name}
              </motion.h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                  >
                    <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 border-0 shadow-card overflow-hidden h-full">
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {item.is_spicy && (
                            <Badge className="bg-red-500 text-white font-bold flex items-center gap-1">
                              <Flame className="w-3 h-3" /> SPICY
                            </Badge>
                          )}
                          {item.is_vegetarian && (
                            <Badge className="bg-green-500 text-white font-bold flex items-center gap-1">
                              <Leaf className="w-3 h-3" /> VEG
                            </Badge>
                          )}
                        </div>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold">{Number(item.rating).toFixed(1)}</span>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <FavoritesButton itemId={item.id} user={user} />
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-heading text-xl font-bold mb-2">{item.name}</h3>
                        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{item.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-heading text-2xl font-bold text-primary">
                            TSh {Number(item.price).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{item.prep_time}min</span>
                            {item.calories && <span>{item.calories} cal</span>}
                          </div>
                        </div>
                        {cart[item.id] ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}><Minus className="w-4 h-4" /></Button>
                              <span className="font-bold text-lg">{cart[item.id]}</span>
                              <Button size="sm" onClick={() => addToCart(item.id, item.name)}><Plus className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        ) : (
                          <Button className="w-full bg-primary hover:bg-primary/90 font-bold group" onClick={() => addToCart(item.id, item.name)}>
                            ADD TO CART
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">No items found</h2>
              <p className="text-muted-foreground">Try adjusting your filters to see more items</p>
            </div>
          )}
        </div>
      </main>

      {getTotalItems() > 0 && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-glow rounded-full px-6 py-6"
            onClick={proceedToCheckout}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Checkout ({getTotalItems()})
          </Button>
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default EnhancedMenu;
