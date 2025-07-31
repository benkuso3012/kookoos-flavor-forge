import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";

const Locations = () => {
  const locations = [
    {
      id: 1,
      name: "Bahari Beach",
      address: "Bahari Beach Road, Dar es Salaam",
      hours: "10:00 AM - 11:00 PM",
      phone: "+255 123 456 789",
      isMain: true
    },
    {
      id: 2,
      name: "Tegeta",
      address: "Tegeta Ward, Kinondoni District",
      hours: "11:00 AM - 10:00 PM",
      phone: "+255 123 456 790",
      isMain: false
    },
    {
      id: 3,
      name: "Sinza",
      address: "Sinza Ward, Kinondoni District",
      hours: "11:00 AM - 10:00 PM",
      phone: "+255 123 456 791",
      isMain: false
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Find Your Nearest
            <span className="block text-primary">Kookoos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three convenient locations across Dar es Salaam to serve you the boldest flavors. 
            Visit us or order for delivery!
          </p>
        </div>

        {/* Locations Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {locations.map((location) => (
            <Card 
              key={location.id}
              className={`relative hover:shadow-glow transition-all duration-300 hover:-translate-y-1 ${
                location.isMain ? 'ring-2 ring-primary ring-opacity-50' : ''
              }`}
            >
              {location.isMain && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold">
                    FLAGSHIP STORE
                  </span>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-heading text-xl font-bold">{location.name}</h3>
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{location.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{location.hours}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{location.phone}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    CALL
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    DIRECTIONS
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Delivery Info */}
        <div className="text-center bg-gradient-primary rounded-xl p-8 text-white">
          <h3 className="font-heading text-2xl font-bold mb-4">
            Can't Make It? We'll Come to You!
          </h3>
          <p className="text-lg mb-6 text-white/90">
            Free delivery within 5km radius • Delivery fee applies beyond 5km
          </p>
          <Button 
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-heading font-bold"
          >
            ORDER FOR DELIVERY
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Locations;