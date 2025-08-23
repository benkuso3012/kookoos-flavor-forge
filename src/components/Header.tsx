import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, ShoppingBag, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from '@supabase/supabase-js';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Check current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="font-heading text-2xl font-bold text-primary">
              KOOKOOS
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary font-medium transition-colors">
              Home
            </Link>
            <Link to="/menu" className="text-foreground hover:text-primary font-medium transition-colors">
              Menu
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary font-medium transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary font-medium transition-colors">
              Contact
            </Link>
            {user && (
              <Link to="/orders" className="text-foreground hover:text-primary font-medium transition-colors">
                My Orders
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link to="/menu">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Order Now
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/menu">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Order Now
                  </Button>
                </Link>
              </>
            )}
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
              <Link 
                to="/" 
                className="text-foreground hover:text-primary font-medium transition-colors"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link 
                to="/menu" 
                className="text-foreground hover:text-primary font-medium transition-colors"
                onClick={toggleMenu}
              >
                Menu
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary font-medium transition-colors"
                onClick={toggleMenu}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-foreground hover:text-primary font-medium transition-colors"
                onClick={toggleMenu}
              >
                Contact
              </Link>
              {user && (
                <Link 
                  to="/orders" 
                  className="text-foreground hover:text-primary font-medium transition-colors"
                  onClick={toggleMenu}
                >
                  My Orders
                </Link>
              )}
              {user && (
                <Link 
                  to="/profile" 
                  className="text-foreground hover:text-primary font-medium transition-colors"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
              )}
              
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                {user ? (
                  <Link to="/menu" onClick={toggleMenu}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 justify-start w-full">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Order Now
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Call to Order
                    </Button>
                    <Link to="/auth" onClick={toggleMenu}>
                      <Button variant="outline" size="sm" className="justify-start w-full mb-2">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/menu" onClick={toggleMenu}>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 justify-start w-full">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Order Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;