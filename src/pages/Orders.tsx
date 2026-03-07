import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  created_at: string;
}

const Orders = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      fetchOrders();
    });
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
        return 'default';
      case 'preparing':
        return 'default';
      case 'ready':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Orders</h1>
            <Button onClick={() => navigate("/menu")}>
              Order Now
            </Button>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">No Orders Yet</h2>
                <p className="text-muted-foreground mb-6">
                  You haven't placed any orders yet. Start by browsing our menu!
                </p>
                <Button onClick={() => navigate("/menu")}>
                  Browse Menu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(-8)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()} at{' '}
                          {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Total Amount</p>
                          <p className="text-2xl font-bold">${order.total_amount}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium mb-2">Delivery Address</p>
                          <p className="text-sm text-muted-foreground max-w-xs">
                            {order.delivery_address}
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {order.status === 'completed' 
                            ? 'Order completed successfully' 
                            : order.status === 'cancelled'
                            ? 'Order was cancelled'
                            : 'Order is being processed'
                          }
                        </div>
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Orders;