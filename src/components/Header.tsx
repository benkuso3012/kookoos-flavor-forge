import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, ShoppingBag } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="font-heading text-2xl font-bold text-primary">
              KOOKOOS
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-foreground hover:text-primary font-medium transition-colors">
              Home
            </a>
            <a href="/menu" className="text-foreground hover:text-primary font-medium transition-colors">
              Menu
            </a>
            <a href="/#locations" className="text-foreground hover:text-primary font-medium transition-colors">
              Locations
            </a>
            <a href="/about" className="text-foreground hover:text-primary font-medium transition-colors">
              About
            </a>
            <a href="/contact" className="text-foreground hover:text-primary font-medium transition-colors">
              Contact
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Order Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a href="/" className="text-foreground hover:text-primary font-medium transition-colors">
                Home
              </a>
              <a href="/menu" className="text-foreground hover:text-primary font-medium transition-colors">
                Menu
              </a>
              <a href="/#locations" className="text-foreground hover:text-primary font-medium transition-colors">
                Locations
              </a>
              <a href="/about" className="text-foreground hover:text-primary font-medium transition-colors">
                About
              </a>
              <a href="/contact" className="text-foreground hover:text-primary font-medium transition-colors">
                Contact
              </a>
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" className="justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Call to Order
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 justify-start">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Order Now
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;