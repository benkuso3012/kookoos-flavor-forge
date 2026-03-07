import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface FavoriteItem {
  id: string;
  menu_item_id: string;
  menu_item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    rating: number;
    is_spicy: boolean;
    is_vegetarian: boolean;
    prep_time: number;
  };
}

const Favorites = () => {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/auth"); return; }
      setUser(user);
      fetchFavorites(user.id);
    });
  }, [navigate]);

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from("favorites")
        .select("id, menu_item_id, menu_item:menu_items(id, name, description, price, image_url, rating, is_spicy, is_vegetarian, prep_time)")
        .eq("user_id", userId);

      if (!error && data) setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
    setLoading(false);
  };

  const removeFavorite = async (favId: string) => {
    await (supabase as any).from("favorites").delete().eq("id", favId);
    setFavorites((prev) => prev.filter((f) => f.id !== favId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8"><div className="text-center">Loading your favorites...</div></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your <span className="text-primary">Favorites</span>
            </h1>
            <p className="text-lg text-muted-foreground">Quick access to your most loved dishes</p>
          </motion.div>

          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6">Start exploring our menu and save your favorite dishes</p>
              <Button onClick={() => navigate("/menu")}>Browse Menu <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav, i) => {
                const item = fav.menu_item;
                if (!item) return null;
                return (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                      <div className="relative overflow-hidden">
                        <img src={item.image_url || "/placeholder.svg"} alt={item.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold">{Number(item.rating).toFixed(1)}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeFavorite(fav.id)} className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white p-2">
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-heading text-lg font-bold">{item.name}</h3>
                          {item.is_spicy && <Badge variant="destructive" className="text-xs">SPICY</Badge>}
                          {item.is_vegetarian && <Badge variant="secondary" className="text-xs">VEG</Badge>}
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{item.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-heading text-xl font-bold text-primary">TSh {Number(item.price).toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">{item.prep_time} min</span>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate("/menu")}>
                          <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
