
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Percent, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface DailySpecial {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  special_price: number;
  menu_items: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    rating: number;
    prep_time: number;
  };
}

const DailySpecials = () => {
  const [specials, setSpecials] = useState<DailySpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecials();
  }, []);

  const fetchSpecials = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data } = await supabase
        .from('daily_specials' as any)
        .select(`
          *,
          menu_items (
            id,
            name,
            description,
            price,
            image_url,
            rating,
            prep_time
          )
        `)
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today);

      if (data) {
        const validSpecials = data.filter((special: any) => special.menu_items) as DailySpecial[];
        setSpecials(validSpecials);
      }
    } catch (error) {
      console.error('Error fetching specials:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading today's specials...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              LIMITED TIME OFFERS
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Today's <span className="text-primary">Specials</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't miss out on these amazing deals available for a limited time only!
            </p>
          </div>

          {specials.length === 0 ? (
            <div className="text-center py-16">
              <Percent className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No specials today</h2>
              <p className="text-muted-foreground mb-6">
                Check back tomorrow for new exciting offers!
              </p>
              <Button onClick={() => navigate("/menu")}>
                Browse Full Menu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {specials.map((special) => (
                <Card 
                  key={special.id}
                  className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 border-0 shadow-card overflow-hidden relative"
                >
                  {/* Discount Badge */}
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-bl-lg font-bold">
                      {special.discount_percentage}% OFF
                    </div>
                  </div>

                  <div className="relative overflow-hidden">
                    <img 
                      src={special.menu_items.image_url} 
                      alt={special.menu_items.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge 
                      className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold"
                    >
                      SPECIAL
                    </Badge>
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold">{special.menu_items.rating}</span>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-heading text-xl font-bold mb-2">{special.title}</h3>
                    <h4 className="font-medium text-muted-foreground mb-2">{special.menu_items.name}</h4>
                    
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {special.description || special.menu_items.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-2xl font-bold text-primary">
                          ${special.special_price?.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${special.menu_items.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {special.menu_items.prep_time} min
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 font-bold group"
                      onClick={() => navigate("/menu")}
                    >
                      ORDER NOW
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DailySpecials;
