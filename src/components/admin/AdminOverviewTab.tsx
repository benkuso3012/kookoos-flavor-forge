import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, differenceInMinutes } from 'date-fns';
import { TrendingUp, TrendingDown, ShoppingBag, Clock, AlertTriangle, Star, ArrowRight } from 'lucide-react';
import RevenueChart from './RevenueChart';

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
  is_available: boolean;
  is_featured: boolean;
  rating: number;
  category_id: string | null;
};

type Store = {
  id: string;
  name: string;
  is_active: boolean;
};

type DailyStats = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  avgOrderValue: number;
  totalMenuItems: number;
  totalCustomers: number;
};

interface AdminOverviewTabProps {
  stats: DailyStats;
  orders: Order[];
  menuItems: MenuItem[];
  stores: Store[];
  statusColor: (status: string) => string;
  onNavigateTab: (tab: string) => void;
}

export default function AdminOverviewTab({ stats, orders, menuItems, stores, statusColor, onNavigateTab }: AdminOverviewTabProps) {
  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));

  const insights = useMemo(() => {
    const todayOrders = orders.filter(o => new Date(o.created_at) >= today);
    const yesterdayOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= yesterday && d < today;
    });

    const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total_amount), 0);
    const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + Number(o.total_amount), 0);
    const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
    const ordersChange = yesterdayOrders.length > 0 ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100 : 0;

    // Top items by how often they appear in order amounts (simple heuristic)
    const unavailableItems = menuItems.filter(i => !i.is_available);
    const featuredItems = menuItems.filter(i => i.is_featured);
    const topRatedItems = [...menuItems].sort((a, b) => b.rating - a.rating).slice(0, 5);
    
    const activeStores = stores.filter(s => s.is_active).length;
    const inactiveStores = stores.filter(s => !s.is_active).length;

    // Pending orders waiting time
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const avgWaitMinutes = pendingOrders.length > 0
      ? pendingOrders.reduce((sum, o) => sum + differenceInMinutes(new Date(), new Date(o.created_at)), 0) / pendingOrders.length
      : 0;

    // Orders by hour today
    const hourlyData = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
    todayOrders.forEach(o => {
      const h = new Date(o.created_at).getHours();
      hourlyData[h].count++;
    });
    const peakHour = hourlyData.reduce((max, h) => h.count > max.count ? h : max, hourlyData[0]);

    return {
      todayRevenue, yesterdayRevenue, revenueChange, ordersChange,
      todayOrders: todayOrders.length, yesterdayOrders: yesterdayOrders.length,
      unavailableItems, featuredItems, topRatedItems,
      activeStores, inactiveStores,
      pendingCount: pendingOrders.length, avgWaitMinutes,
      peakHour: peakHour.hour, peakCount: peakHour.count,
    };
  }, [orders, menuItems, stores, today, yesterday]);

  const ChangeIndicator = ({ value, suffix = '%' }: { value: number; suffix?: string }) => (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
      {value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {value >= 0 ? '+' : ''}{Math.round(value)}{suffix}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Quick Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Comparison */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Today vs Yesterday</p>
                  <p className="text-2xl font-bold text-foreground mt-1">TSh {insights.todayRevenue.toLocaleString()}</p>
                </div>
                <ChangeIndicator value={insights.revenueChange} />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Yesterday: TSh {insights.yesterdayRevenue.toLocaleString()}</span>
              </div>
              <div className="mt-3 flex gap-3">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (insights.todayRevenue / Math.max(insights.yesterdayRevenue, 1)) * 100)}%` }} transition={{ duration: 0.8 }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Alerts */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className={`border-border ${insights.pendingCount > 0 ? 'ring-2 ring-yellow-400/30' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending Attention</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{insights.pendingCount} orders</p>
                </div>
                {insights.pendingCount > 0 && <AlertTriangle className="w-5 h-5 text-yellow-500 animate-pulse" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {insights.pendingCount > 0
                  ? `Avg wait: ${Math.round(insights.avgWaitMinutes)} min`
                  : 'All caught up! 🎉'}
              </p>
              {insights.pendingCount > 0 && (
                <Button variant="outline" size="sm" className="mt-3 w-full text-xs gap-1" onClick={() => onNavigateTab('orders')}>
                  <Clock className="w-3.5 h-3.5" /> View Pending <ArrowRight className="w-3 h-3" />
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Peak Hours */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Today's Peak</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {insights.peakCount > 0 ? `${insights.peakHour}:00` : 'No data'}
                  </p>
                </div>
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                {insights.peakCount > 0
                  ? `${insights.peakCount} orders at peak hour`
                  : 'Orders will appear as they come in'}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <span>Total today:</span>
                <span className="font-semibold text-foreground">{insights.todayOrders} orders</span>
                <ChangeIndicator value={insights.ordersChange} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <RevenueChart orders={orders} />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base">Order Status Breakdown</CardTitle>
            <CardDescription className="text-xs">All-time distribution across {orders.length} orders</CardDescription>
          </CardHeader>
          <CardContent>
            {['pending', 'preparing', 'ready', 'delivered', 'cancelled'].map(status => {
              const count = orders.filter(o => o.status === status).length;
              const pct = orders.length ? (count / orders.length) * 100 : 0;
              return (
                <div key={status} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                        status === 'pending' ? 'bg-yellow-500' :
                        status === 'preparing' ? 'bg-blue-500' :
                        status === 'ready' ? 'bg-green-500' :
                        status === 'delivered' ? 'bg-muted-foreground' :
                        'bg-red-500'
                      }`} />
                      <span className="capitalize text-foreground">{status}</span>
                    </div>
                    <span className="text-muted-foreground font-medium">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        status === 'pending' ? 'bg-yellow-500' :
                        status === 'preparing' ? 'bg-blue-500' :
                        status === 'ready' ? 'bg-green-500' :
                        status === 'delivered' ? 'bg-muted-foreground' :
                        'bg-red-500'
                      }`}
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
      </div>

      {/* Bottom Detail Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Top Rated Items */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500" /> Top Rated Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {insights.topRatedItems.map((item, i) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                    <span className="text-foreground font-medium truncate max-w-[140px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">⭐ {item.rating}</span>
                    <span className="text-xs font-medium text-foreground">TSh {Number(item.price).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {insights.topRatedItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No menu items yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base">Menu Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Items</span>
                <Badge variant="secondary" className="font-semibold">{menuItems.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{menuItems.filter(i => i.is_available).length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unavailable</span>
                <Badge variant={insights.unavailableItems.length > 0 ? 'destructive' : 'secondary'}>
                  {insights.unavailableItems.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Featured</span>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{insights.featuredItems.length}</Badge>
              </div>
              {insights.unavailableItems.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-red-500 font-medium mb-1">⚠ Unavailable items:</p>
                  {insights.unavailableItems.slice(0, 3).map(item => (
                    <p key={item.id} className="text-xs text-muted-foreground">• {item.name}</p>
                  ))}
                  {insights.unavailableItems.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{insights.unavailableItems.length - 3} more</p>
                  )}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full text-xs mt-1" onClick={() => onNavigateTab('menu')}>
                Manage Menu <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Store Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-base">Store Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Locations</span>
                <Badge variant="secondary" className="font-semibold">{stores.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600 font-medium">🟢 Active</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{insights.activeStores}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">🔴 Inactive</span>
                <Badge variant={insights.inactiveStores > 0 ? 'destructive' : 'secondary'}>{insights.inactiveStores}</Badge>
              </div>

              {stores.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border space-y-1.5">
                  {stores.slice(0, 4).map(store => (
                    <div key={store.id} className="flex items-center justify-between text-xs">
                      <span className="text-foreground truncate max-w-[130px]">{store.name}</span>
                      <span className={store.is_active ? 'text-green-600' : 'text-red-500'}>{store.is_active ? 'Open' : 'Closed'}</span>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full text-xs mt-1" onClick={() => onNavigateTab('stores')}>
                Manage Stores <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground text-base">Live Order Feed</CardTitle>
          <CardDescription className="text-xs">Latest 10 orders across all stores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orders.slice(0, 10).map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground w-16">#{order.id.slice(0, 6)}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'MMM d, HH:mm')}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px] hidden sm:inline">{order.delivery_address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground text-sm">TSh {Number(order.total_amount).toLocaleString()}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(order.status)}`}>{order.status}</span>
                </div>
              </motion.div>
            ))}
            {orders.length === 0 && <p className="text-center text-muted-foreground py-6 text-sm">No orders yet — they'll appear here in real-time</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
