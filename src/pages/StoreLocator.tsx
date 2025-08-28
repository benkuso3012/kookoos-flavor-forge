
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Phone, Navigation, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  is_flagship: boolean;
  latitude: number;
  longitude: number;
}

const StoreLocator = () => {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('store_locations')
      .select('*')
      .eq('is_active', true)
      .order('is_flagship', { ascending: false });

    if (data) {
      setLocations(data);
    }
    setLoading(false);
  };

  const openInMaps = (location: StoreLocation) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const callStore = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading locations...</div>
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
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Find Your Nearest
              <span className="block text-primary">Kookoos</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three convenient locations across Dar es Salaam to serve you the boldest flavors. 
              Visit us or order for delivery!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {locations.map((location) => (
              <Card 
                key={location.id}
                className={`relative hover:shadow-glow transition-all duration-300 hover:-translate-y-1 ${
                  location.is_flagship ? 'ring-2 ring-primary ring-opacity-50' : ''
                }`}
              >
                {location.is_flagship && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 font-bold">
                      <Star className="w-3 h-3 mr-1" />
                      FLAGSHIP STORE
                    </Badge>
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
                      onClick={() => callStore(location.phone)}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      CALL
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => openInMaps(location)}
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
              onClick={() => window.location.href = '/menu'}
            >
              ORDER FOR DELIVERY
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StoreLocator;
