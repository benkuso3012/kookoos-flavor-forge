
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from '@supabase/supabase-js';

interface FavoritesButtonProps {
  itemId: string;
  user: User | null;
}

const FavoritesButton = ({ itemId, user }: FavoritesButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [itemId, user]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      // For now, we'll use local storage to simulate favorites
      // This can be updated once the database is properly set up
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isFav = favorites.some((fav: any) => fav.itemId === itemId && fav.userId === user.id);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // For now, we'll use local storage to simulate favorites
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      if (isFavorite) {
        const updatedFavorites = favorites.filter((fav: any) => 
          !(fav.itemId === itemId && fav.userId === user.id)
        );
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Item removed from your favorites",
        });
      } else {
        const newFavorite = { itemId, userId: user.id, timestamp: Date.now() };
        favorites.push(newFavorite);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "Item added to your favorites",
        });
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFavorite}
      disabled={loading}
      className="p-2"
    >
      <Heart 
        className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
      />
    </Button>
  );
};

export default FavoritesButton;
