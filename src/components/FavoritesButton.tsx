
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
      const { data } = await supabase
        .from('user_favorites' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('menu_item_id', itemId)
        .maybeSingle();

      setIsFavorite(!!data);
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
      if (isFavorite) {
        await supabase
          .from('user_favorites' as any)
          .delete()
          .eq('user_id', user.id)
          .eq('menu_item_id', itemId);

        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Item removed from your favorites",
        });
      } else {
        await supabase
          .from('user_favorites' as any)
          .insert({
            user_id: user.id,
            menu_item_id: itemId
          });

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
