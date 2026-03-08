import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, ShoppingBag, UtensilsCrossed, Users, TrendingUp, Clock, DollarSign, LogOut, Home, RefreshCw, Plus, Pencil, MapPin, HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import RevenueChart from '@/components/admin/RevenueChart';
import MenuItemModal from '@/components/admin/MenuItemModal';
import OrderNotifications from '@/components/admin/OrderNotifications';
import StoreModal from '@/components/admin/StoreModal';
import AdminOnboarding, { resetAdminOnboarding } from '@/components/admin/AdminOnboarding';

type Order = {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  phone: string;
  notes: string | null;
  created_at: string;
  user_id: string;
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category_id: string | null;
  is_available: boolean;
  is_featured: boolean;
  is_spicy: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  calories: number | null;
  rating: number;
  prep_time: number;
  description: string | null;
  image_url: string | null;
};

type Category = { id: string; name: string };

type Store = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  hours: string | null;
  is_active: boolean;
  is_flagship: boolean;
  latitude: number | null;
  longitude: number | null;
};

type DailyStats = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  avgOrderValue: number;
  totalMenuItems: number;
  totalCustomers: number;
};

export default function AdminDashboard() {
  const { isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DailyStats>({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, avgOrderValue: 0, totalMenuItems: 0, totalCustomers: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchOrders(), fetchMenuItems(), fetchCategories(), fetchStores()]);
    setRefreshing(false);
  }, []);

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [ordersRes, menuRes, profilesRes] = await Promise.all([
      (supabase as any).from('orders').select('*'),
      (supabase as any).from('menu_items').select('id', { count: 'exact', head: true }),
      (supabase as any).from('profiles').select('id', { count: 'exact', head: true }),
    ]);
    const allOrders: Order[] = ordersRes.data || [];
    const todayOrders = allOrders.filter(o => new Date(o.created_at) >= today);
    const totalRevenue = todayOrders.reduce((s, o) => s + Number(o.total_amount), 0);
    setStats({
      totalOrders: todayOrders.length,
      totalRevenue,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      avgOrderValue: todayOrders.length ? totalRevenue / todayOrders.length : 0,
      totalMenuItems: menuRes.count || 0,
      totalCustomers: profilesRes.count || 0,
    });
  };

  const fetchOrders = async () => {
    const { data } = await (supabase as any).from('orders').select('*').order('created_at', { ascending: false }).limit(50);
    setOrders(data || []);
  };

  const fetchMenuItems = async () => {
    const { data } = await (supabase as any).from('menu_items').select('*').order('name');
    setMenuItems(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await (supabase as any).from('menu_categories').select('id, name').order('sort_order');
    setCategories(data || []);
  };

  const fetchStores = async () => {
    const { data } = await (supabase as any).from('stores').select('*').order('name');
    setStores(data || []);
  };

  const toggleStoreActive = async (storeId: string, currentActive: boolean) => {
    const { error } = await (supabase as any).from('stores').update({ is_active: !currentActive }).eq('id', storeId);
    if (error) { toast.error('Failed to update store'); return; }
    toast.success(`Store ${!currentActive ? 'activated' : 'deactivated'}`);
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, is_active: !currentActive } : s));
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await (supabase as any).from('orders').update({ status }).eq('id', orderId);
    if (error) { toast.error('Failed to update order'); return; }
    toast.success(`Order updated to ${status}`);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    fetchStats();
  };

  const toggleMenuAvailability = async (itemId: string, available: boolean) => {
    const { error } = await (supabase as any).from('menu_items').update({ is_available: !available }).eq('id', itemId);
    if (error) { toast.error('Failed to update item'); return; }
    toast.success(`Item ${!available ? 'enabled' : 'disabled'}`);
    setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, is_available: !available } : i));
  };

  const toggleFeatured = async (itemId: string, featured: boolean) => {
    const { error } = await (supabase as any).from('menu_items').update({ is_featured: !featured }).eq('id', itemId);
    if (error) { toast.error('Failed to update'); return; }
    setMenuItems(prev => prev.map(i => i.id === itemId ? { ...i, is_featured: !featured } : i));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (item: MenuItem) => { setEditItem(item); setModalOpen(true); };

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'delivered': return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Real-time listener */}
      <OrderNotifications onNewOrder={fetchAll} />

      {/* Top Nav */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Kookoos Admin</h1>
              <p className="text-xs text-muted-foreground">Restaurant Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchAll} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Today's Orders", value: stats.totalOrders, icon: ShoppingBag, color: 'text-primary' },
            { label: "Today's Revenue", value: `TSh ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
            { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-600' },
            { label: 'Avg Order', value: `TSh ${Math.round(stats.avgOrderValue).toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600' },
            { label: 'Menu Items', value: stats.totalMenuItems, icon: UtensilsCrossed, color: 'text-purple-600' },
            { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'text-pink-600' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="orders" className="gap-1.5"><ShoppingBag className="w-4 h-4" /> Orders</TabsTrigger>
            <TabsTrigger value="menu" className="gap-1.5"><UtensilsCrossed className="w-4 h-4" /> Menu</TabsTrigger>
            <TabsTrigger value="stores" className="gap-1.5"><MapPin className="w-4 h-4" /> Stores</TabsTrigger>
            <TabsTrigger value="overview" className="gap-1.5"><BarChart3 className="w-4 h-4" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Recent Orders</CardTitle>
                <CardDescription>Manage and track all incoming orders — new orders appear in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No orders yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}…</TableCell>
                            <TableCell className="text-sm">{format(new Date(order.created_at), 'MMM d, HH:mm')}</TableCell>
                            <TableCell className="font-semibold">TSh {Number(order.total_amount).toLocaleString()}</TableCell>
                            <TableCell className="text-sm max-w-[150px] truncate">{order.delivery_address}</TableCell>
                            <TableCell className="text-sm">{order.phone}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="preparing">Preparing</SelectItem>
                                  <SelectItem value="ready">Ready</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Menu Management</CardTitle>
                  <CardDescription>Create, edit, and manage menu items</CardDescription>
                </div>
                <Button onClick={openCreate} className="gap-1.5">
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Prep Time</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Edit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {menuItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>TSh {Number(item.price).toLocaleString()}</TableCell>
                          <TableCell>{item.rating} ⭐</TableCell>
                          <TableCell>{item.prep_time} min</TableCell>
                          <TableCell>
                            <Button
                              variant={item.is_available ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => toggleMenuAvailability(item.id, item.is_available)}
                            >
                              {item.is_available ? 'Available' : 'Unavailable'}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={item.is_featured ? 'default' : 'ghost'}
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => toggleFeatured(item.id, item.is_featured)}
                            >
                              {item.is_featured ? '⭐ Featured' : 'Set Featured'}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics/Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-4">
              <RevenueChart orders={orders} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Orders by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {['pending', 'preparing', 'ready', 'delivered', 'cancelled'].map(status => {
                    const count = orders.filter(o => o.status === status).length;
                    const pct = orders.length ? (count / orders.length) * 100 : 0;
                    return (
                      <div key={status} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-foreground">{status}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 8).map(order => (
                      <div key={order.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                        <div>
                          <span className="font-medium text-foreground">#{order.id.slice(0, 6)}</span>
                          <span className="text-muted-foreground ml-2">{format(new Date(order.created_at), 'HH:mm')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">TSh {Number(order.total_amount).toLocaleString()}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${statusColor(order.status)}`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-center text-muted-foreground">No recent activity</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stores Tab */}
          <TabsContent value="stores">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Store Management</CardTitle>
                  <CardDescription>Create, edit, and manage store locations</CardDescription>
                </div>
                <Button onClick={() => { setEditStore(null); setStoreModalOpen(true); }} className="gap-1.5">
                  <Plus className="w-4 h-4" /> Add Store
                </Button>
              </CardHeader>
              <CardContent>
                {stores.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No stores yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Flagship</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead>Edit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stores.map(store => (
                          <TableRow key={store.id} className={!store.is_active ? 'opacity-50' : ''}>
                            <TableCell className="font-medium">{store.name}</TableCell>
                            <TableCell className="text-sm max-w-[200px] truncate">{store.address}</TableCell>
                            <TableCell className="text-sm">{store.phone || '—'}</TableCell>
                            <TableCell className="text-sm">{store.hours || '—'}</TableCell>
                            <TableCell>{store.is_flagship ? '⭐' : '—'}</TableCell>
                            <TableCell>
                              <Switch
                                checked={store.is_active}
                                onCheckedChange={() => toggleStoreActive(store.id, store.is_active)}
                              />
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => { setEditStore(store); setStoreModalOpen(true); }}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Menu Item Modal */}
      <MenuItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editItem}
        onSaved={() => { fetchMenuItems(); fetchStats(); }}
        categories={categories}
      />
      <StoreModal
        open={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
        store={editStore}
        onSaved={fetchStores}
      />
    </div>
  );
}
