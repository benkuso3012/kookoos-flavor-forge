import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import bombaBox from "@/assets/bomba-box.jpg";
import chickenCombo from "@/assets/chicken-combo.jpg";
import crispyChicken from "@/assets/crispy-chicken.jpg";

const fallbackImages = [bombaBox, chickenCombo, crispyChicken];

interface FeaturedItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  rating: number;
  is_spicy: boolean;
}

const MenuPreview = () => {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await (supabase as any)
        .from("menu_items")
        .select("id, name, description, price, image_url, rating, is_spicy")
        .eq("is_featured", true)
        .eq("is_available", true)
        .order("rating", { ascending: false })
        .limit(3);

      if (!error && data?.length) {
        setItems(data);
      } else {
        // fallback
        setItems([
          { id: "1", name: "Bomba Box", description: "Signature fried chicken with spiced fries and drink", price: 15000, image_url: null, rating: 4.9, is_spicy: true },
          { id: "2", name: "Chicken Baga", description: "Crispy chicken burger with our secret sauce", price: 12000, image_url: null, rating: 4.8, is_spicy: false },
          { id: "3", name: "Crispy Wings", description: "Golden crispy chicken wings with tangy orange sauce", price: 8000, image_url: null, rating: 4.7, is_spicy: true },
        ]);
      }
    };
    fetchFeatured();
  }, []);

  const getBadge = (item: FeaturedItem, i: number) => {
    if (i === 0) return "SIGNATURE";
    if (item.is_spicy) return "SPICY";
    return "POPULAR";
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            TASTE THE DIFFERENCE
          </Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Signature</span> Flavors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every bite tells a story of bold Tanzanian flavors and street food mastery.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {items.map((item, i) => (
            <motion.div key={item.id} variants={cardVariants}>
              <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 border-0 shadow-card overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={item.image_url || fallbackImages[i % fallbackImages.length]}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold">
                    {getBadge(item, i)}
                  </Badge>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold">{Number(item.rating).toFixed(1)}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-heading text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-2xl font-bold text-primary">
                      TSh {Number(item.price).toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 font-bold group"
                      onClick={() => navigate("/menu")}
                    >
                      ADD
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Button
            size="lg"
            className="bg-gradient-primary text-white font-heading font-bold text-lg px-12 py-6 shadow-glow hover:shadow-xl transition-all"
            onClick={() => navigate("/menu")}
          >
            VIEW FULL MENU
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MenuPreview;
