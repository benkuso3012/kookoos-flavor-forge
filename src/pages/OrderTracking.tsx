import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Clock, CheckCircle, Truck, ChefHat } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  item_name: string;
  item_price: number;
  quantity: number;
}

const OrderTracking = () => {
  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      fetchOrder();
    });
  }, [orderId, navigate]);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      // Fetch order details
      const { data: orderData, error: orderError } = await (supabase as any)
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Fetch order items
      const { data: itemsData, error: itemsError } = await (supabase as any)
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      setOrder(orderData);
      setOrderItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching order:', error);
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    const iconClass = isActive ? "text-primary" : "text-muted-foreground";
    
    switch (status) {
      case 'pending':
        return <Clock className={`h-5 w-5 ${iconClass}`} />;
      case 'confirmed':
        return <CheckCircle className={`h-5 w-5 ${iconClass}`} />;
      case 'preparing':
        return <ChefHat className={`h-5 w-5 ${iconClass}`} />;
      case 'ready':
        return <Truck className={`h-5 w-5 ${iconClass}`} />;
      case 'completed':
        return <CheckCircle className={`h-5 w-5 ${iconClass}`} />;
      default:
        return <Clock className={`h-5 w-5 ${iconClass}`} />;
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

  const statusSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready for Delivery' },
    { key: 'completed', label: 'Delivered' }
  ];

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex(step => step.key === order.status);
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

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <Button onClick={() => navigate("/orders")}>
              View All Orders
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Order #{order.id.slice(-8)}</h1>
            <Badge variant={getStatusVariant(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>

          {/* Order Status Timeline */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 ${
                      index <= currentStepIndex 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-muted-foreground bg-background'
                    }`}>
                      {getStatusIcon(step.key, index <= currentStepIndex)}
                    </div>
                    <span className={`text-sm text-center ${
                      index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                    {index < statusSteps.length - 1 && (
                      <div className={`w-full h-0.5 absolute translate-y-5 ${
                        index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                      }`} style={{ 
                        left: `${(100 / (statusSteps.length - 1)) * index + (50 / (statusSteps.length - 1))}%`,
                        width: `${100 / (statusSteps.length - 1)}%`
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.item_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.item_price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.item_price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total_amount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Delivery Address</h3>
                  <p className="text-muted-foreground">{order.delivery_address}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Phone Number</h3>
                  <p className="text-muted-foreground">{order.phone}</p>
                </div>
                
                {order.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Special Instructions</h3>
                    <p className="text-muted-foreground">{order.notes}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium mb-2">Order Date</h3>
                  <p className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} at{' '}
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button onClick={() => navigate("/orders")} variant="outline">
              View All Orders
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderTracking;