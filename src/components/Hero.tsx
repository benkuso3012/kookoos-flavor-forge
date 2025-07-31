import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";
import heroChicken from "@/assets/hero-chicken.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroChicken})` }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-screen flex items-center">
        <div className="max-w-3xl text-white">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Bahari Beach • Tegeta • Sinza</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-6">
            BOLD
            <span className="block text-accent">FLAVOR</span>
            <span className="block">AWAITS</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl leading-relaxed mb-8 text-white/90">
            Experience the most vibrant fried chicken and street food in Tanzania. 
            Fresh, bold, and unapologetically delicious.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-heading font-bold text-lg px-8 py-6 shadow-glow"
            >
              ORDER NOW
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary font-heading font-bold text-lg px-8 py-6"
            >
              <Phone className="w-5 h-5 mr-2" />
              CALL TO ORDER
            </Button>
          </div>
          
          {/* Special Offer */}
          <div className="mt-8 inline-block bg-accent text-accent-foreground px-6 py-3 rounded-xl font-bold">
            🔥 NEW: Bomba Box - Only TSh 15,000!
          </div>
        </div>
      </div>
      
      {/* Floating Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium">Scroll to Explore</span>
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;