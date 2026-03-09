import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ShoppingBag, Clock, CheckCircle, ChefHat, Truck, XCircle, ArrowRight } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  created_at: string;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Clock, label: "Pending" },
  confirmed: { color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: CheckCircle, label: "Confirmed" },
  preparing: { color: "bg-orange-500/10 text-orange-600 border-orange-500/30", icon: ChefHat, label: "Preparing" },
  ready: { color: "bg-green-500/10 text-green-600 border-green-500/30", icon: Truck, label: "Ready" },
  completed: { color: "bg-green-500/10 text-green-600 border-green-500/30", icon: CheckCircle, label: "Completed" },
  cancelled: { color: "bg-red-500/10 text-red-600 border-red-500/30", icon: XCircle, label: "Cancelled" },
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate("/auth"); return; }
      fetchOrders();
    });
  }, [navigate]);

  const fetchOrders = async () => {
    const { data } = await (supabase as any).from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="font-heading text-3xl font-bold">My Orders</h1>
                <p className="text-muted-foreground">Track and manage your orders</p>
              </div>
              <Button onClick={() => navigate("/menu")} className="font-bold group">
                Order Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {orders.length === 0 ? (
              <Card className="border-0 shadow-card">
                <CardContent className="text-center py-16">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h2 className="font-heading text-xl font-bold mb-2">No Orders Yet</h2>
                  <p className="text-muted-foreground mb-6">Start by browsing our delicious menu!</p>
                  <Button onClick={() => navigate("/menu")} className="font-bold">Browse Menu</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order, i) => {
                  const config = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="border-0 shadow-card hover:shadow-glow transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.color}`}>
                                <StatusIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-bold">Order #{order.id.slice(-8)}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                              <div>
                                <p className="font-heading text-xl font-bold text-primary">TSh {Number(order.total_amount).toLocaleString()}</p>
                                <Badge variant="outline" className={config.color}>{config.label}</Badge>
                              </div>
                              <Link to={`/orders/${order.id}`}>
                                <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
