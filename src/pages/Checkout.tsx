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
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";
import { MapPin, Phone, MessageSquare, ShoppingBag, ArrowRight } from "lucide-react";

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
  const { clearCart } = useCart();

  const cartItems: CartItem[] = location.state?.cartItems || [];
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/auth"); return; }
      setUser(user);
      fetchProfile(user.id);
    });
    if (cartItems.length === 0) {
      toast({ title: "Empty Cart", description: "Please add items to your cart first", variant: "destructive" });
      navigate("/menu");
    }
  }, [navigate, cartItems.length]);

  const fetchProfile = async (userId: string) => {
    const { data } = await (supabase as any).from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  };

  const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!user) { toast({ title: "Error", description: "You must be logged in", variant: "destructive" }); setLoading(false); return; }

    const formData = new FormData(e.currentTarget);
    const deliveryAddress = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const notes = formData.get("notes") as string;

    try {
      const { data: order, error: orderError } = await (supabase as any)
        .from("orders").insert({ user_id: user.id, total_amount: total, delivery_address: deliveryAddress, phone, notes, status: "pending" }).select().single();
      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({ order_id: order!.id, item_name: item.name, item_price: item.price, quantity: item.quantity }));
      const { error: itemsError } = await (supabase as any).from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      toast({ title: "Order Placed! 🎉", description: "Your order has been successfully placed" });
      navigate(`/orders/${order!.id}`);
    } catch (error: any) {
      toast({ title: "Order Failed", description: error.message || "Failed to place order", variant: "destructive" });
    }
    setLoading(false);
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <h1 className="font-heading text-4xl font-bold">Checkout</h1>
              <p className="text-muted-foreground mt-2">Complete your order</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" /> Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-sm">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm">TSh {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-lg font-bold">Total</span>
                    <span className="font-heading text-2xl font-bold text-primary">TSh {total.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Form */}
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitOrder} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" name="phone" type="tel" placeholder="+255 xxx xxx xxx" className="pl-10" defaultValue={profile?.phone || ""} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea id="address" name="address" placeholder="Full delivery address..." className="pl-10" defaultValue={profile?.address || ""} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Special Instructions (Optional)</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea id="notes" name="notes" placeholder="Any special instructions..." className="pl-10" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full font-bold text-lg py-6 group" disabled={loading}>
                      {loading ? "Placing Order..." : `Place Order — TSh ${total.toLocaleString()}`}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
