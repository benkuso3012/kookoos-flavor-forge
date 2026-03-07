import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const Checkout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get cart items from navigation state
  const cartItems: CartItem[] = location.state?.cartItems || [];
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    // Check authentication
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      
      // Fetch user profile
      fetchProfile(user.id);
    });

    // Redirect if no cart items
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart first",
        variant: "destructive",
      });
      navigate("/menu");
    }
  }, [navigate, cartItems.length]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles' as any)
      .select('*')
      .eq('id', userId)
      .single();
      
    if (data) {
      setProfile(data);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to place an order",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const deliveryAddress = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const notes = formData.get("notes") as string;

    try {
      // Create order
      const { data: order, error: orderError } = await (supabase
        .from('orders' as any) as any)
        .insert({
          user_id: user.id,
          total_amount: total,
          delivery_address: deliveryAddress,
          phone: phone,
          notes: notes,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order!.id,
        item_name: item.name,
        item_price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await (supabase
        .from('order_items' as any) as any)
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed",
      });

      // Navigate to order confirmation
      navigate(`/orders/${order!.id}`);

    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Your phone number"
                      defaultValue={profile?.phone || ""}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Enter your full delivery address"
                      defaultValue={profile?.address || ""}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Instructions (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any special instructions for your order..."
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Placing Order..." : `Place Order - $${total.toFixed(2)}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;