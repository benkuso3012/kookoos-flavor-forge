import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";
import bombaBox from "@/assets/bomba-box.jpg";
import chickenCombo from "@/assets/chicken-combo.jpg";
import crispyChicken from "@/assets/crispy-chicken.jpg";

const MenuPreview = () => {
  const featuredItems = [
    {
      id: 1,
      name: "Bomba Box",
      description: "Our signature fried chicken with spiced fries and drink",
      price: "TSh 15,000",
      image: bombaBox,
      badge: "SIGNATURE",
      rating: 4.9
    },
    {
      id: 2,
      name: "Chicken Baga",
      description: "Crispy chicken burger with our secret sauce",
      price: "TSh 12,000",
      image: chickenCombo,
      badge: "POPULAR",
      rating: 4.8
    },
    {
      id: 3,
      name: "Crispy Wings",
      description: "Golden crispy chicken wings with tangy orange sauce",
      price: "TSh 8,000",
      image: crispyChicken,
      badge: "SPICY",
      rating: 4.7
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            TASTE THE DIFFERENCE
          </Badge>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Signature</span> Flavors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every bite tells a story of bold Tanzanian flavors and street food mastery. 
            Handcrafted with love, served with pride.
          </p>
        </div>

        {/* Featured Menu Items */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredItems.map((item) => (
            <Card 
              key={item.id} 
              className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-2 border-0 shadow-card overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge 
                  className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold"
                >
                  {item.badge}
                </Badge>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold">{item.rating}</span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="font-heading text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-heading text-2xl font-bold text-primary">
                    {item.price}
                  </span>
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 font-bold group"
                  >
                    ADD
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Full Menu CTA */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-primary text-white font-heading font-bold text-lg px-12 py-6 shadow-glow hover:shadow-xl transition-all"
          >
            VIEW FULL MENU
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MenuPreview;