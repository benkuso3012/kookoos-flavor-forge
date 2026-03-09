import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Truck, ChefHat, MapPin, Phone, MessageSquare, ArrowLeft } from "lucide-react";

interface Order {
  id: string; status: string; total_amount: number; delivery_address: string; phone: string; notes: string; created_at: string; updated_at: string;
}

interface OrderItem {
  id: string; item_name: string; item_price: number; quantity: number;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Out for Delivery", icon: Truck },
  { key: "completed", label: "Delivered", icon: CheckCircle },
];

const OrderTracking = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/auth"); return; }
      fetchOrder();
    });
  }, [orderId, navigate]);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const [orderRes, itemsRes] = await Promise.all([
        (supabase as any).from("orders").select("*").eq("id", orderId).single(),
        (supabase as any).from("order_items").select("*").eq("order_id", orderId),
      ]);
      if (orderRes.error) throw orderRes.error;
      setOrder(orderRes.data);
      setOrderItems(itemsRes.data || []);
    } catch {
      navigate("/orders");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 flex items-center justify-center min-h-[50vh]">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Order Not Found</h1>
          <Button onClick={() => navigate("/orders")}>View All Orders</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="ghost" className="mb-4" onClick={() => navigate("/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
            </Button>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="font-heading text-3xl font-bold">Order #{order.id.slice(-8)}</h1>
                <p className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString()}</p>
              </div>
              <Badge className={order.status === "cancelled" ? "bg-destructive" : "bg-primary"} variant="default">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            {/* Status Timeline */}
            {order.status !== "cancelled" && (
              <Card className="border-0 shadow-card mb-8">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    {statusSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isActive = index <= currentStepIndex;
                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10">
                          <motion.div
                            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                              isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                            initial={{ scale: 0.5 }}
                            animate={{ scale: isActive ? 1 : 0.8 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <StepIcon className="h-5 w-5" />
                          </motion.div>
                          <span className={`text-xs font-bold text-center ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Order Items */}
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="font-heading">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-sm">{item.item_name}</h3>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm">TSh {(item.item_price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-lg font-bold">Total</span>
                    <span className="font-heading text-2xl font-bold text-primary">TSh {Number(order.total_amount).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="font-heading">Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Phone</p>
                      <p className="text-sm text-muted-foreground">{order.phone}</p>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">Notes</p>
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    </div>
                  )}
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

export default OrderTracking;
