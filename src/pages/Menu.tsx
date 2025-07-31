import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, ShoppingBag, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import bombaBox from "@/assets/bomba-box.jpg";
import chickenCombo from "@/assets/chicken-combo.jpg";
import crispyChicken from "@/assets/crispy-chicken.jpg";

const Menu = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<{[key: number]: number}>({});

  const menuCategories = [
    {
      name: "Signature Boxes",
      items: [
        {
          id: 1,
          name: "Bomba Box",
          description: "Our signature fried chicken with spiced fries and drink",
          price: 15000,
          image: bombaBox,
          badge: "SIGNATURE",
          rating: 4.9
        },
        {
          id: 2,
          name: "Chicken Baga",
          description: "Crispy chicken burger with our secret sauce",
          price: 12000,
          image: chickenCombo,
          badge: "POPULAR",
          rating: 4.8
        }
      ]
    },
    {
      name: "Wings & Pieces",
      items: [
        {
          id: 3,
          name: "Crispy Wings",
          description: "Golden crispy chicken wings with tangy orange sauce",
          price: 8000,
          image: crispyChicken,
          badge: "SPICY",
          rating: 4.7
        },
        {
          id: 4,
          name: "Chicken Strips",
          description: "Tender chicken strips with honey mustard sauce",
          price: 10000,
          image: crispyChicken,
          badge: "NEW",
          rating: 4.6
        }
      ]
    }
  ];

  const addToCart = (itemId: number, itemName: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    toast({
      title: "Added to cart!",
      description: `${itemName} has been added to your cart.`,
    });
  };

  const removeFromCart = (itemId: number) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
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

          {/* Menu Categories */}
          {menuCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-16">
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
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-heading text-2xl font-bold text-primary">
                          TSh {item.price.toLocaleString()}
                        </span>
                      </div>

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
        </div>
      </main>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-glow rounded-full px-6 py-6"
            onClick={() => {
              toast({
                title: "Cart feature coming soon!",
                description: "Full ordering system will be available soon.",
              });
            }}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {getTotalItems()} Items
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Menu;