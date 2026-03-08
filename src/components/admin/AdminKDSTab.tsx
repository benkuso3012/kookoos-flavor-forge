import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, ChefHat, Bell, Maximize2, Minimize2, RefreshCw, Timer, TrendingUp, BarChart3, Gauge } from 'lucide-react';
import { toast } from 'sonner';

type Order = {
  id: string; status: string; total_amount: number;
  delivery_address: string; phone: string; notes: string | null;
  created_at: string; updated_at: string; user_id: string;
};
type OrderItem = { id: string; item_name: string; quantity: number; item_price: number };
type MenuItemPrepTime = { name: string; prep_time: number };

const KITCHEN_STATUSES = ['pending', 'preparing', 'ready'] as const;

const statusConfig: Record<string, { bg: string; border: string; badge: string; label: string }> = {
  pending: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', badge: 'bg-yellow-500 text-yellow-950', label: 'NEW' },
  preparing: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', badge: 'bg-blue-500 text-white', label: 'COOKING' },
  ready: { bg: 'bg-green-500/10', border: 'border-green-500/40', badge: 'bg-green-500 text-green-950', label: 'READY' },
};

export default function AdminKDSTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [menuPrepTimes, setMenuPrepTimes] = useState<Record<string, number>>({});
  const [fullscreen, setFullscreen] = useState(false);
  const [now, setNow] = useState(new Date());

  const fetchMenuPrepTimes = useCallback(async () => {
    const { data } = await (supabase as any).from('menu_items').select('name, prep_time');
    const map: Record<string, number> = {};
    (data || []).forEach((item: MenuItemPrepTime) => { map[item.name] = item.prep_time; });
    setMenuPrepTimes(map);
  }, []);

  const fetchOrders = useCallback(async () => {
    // Fetch active + recently completed orders in parallel
    const [activeRes, completedRes] = await Promise.all([
      (supabase as any).from('orders').select('*').in('status', KITCHEN_STATUSES).order('created_at', { ascending: true }),
      (supabase as any).from('orders').select('*').in('status', ['delivered', 'ready']).order('updated_at', { ascending: false }).limit(50),
    ]);
    const list: Order[] = activeRes.data || [];
    const completed: Order[] = completedRes.data || [];
    setOrders(list);
    setCompletedOrders(completed);

    // Fetch items for all active orders
    if (list.length > 0) {
      const results = await Promise.all(
        list.map(o => (supabase as any).from('order_items').select('*').eq('order_id', o.id))
      );
      const map: Record<string, OrderItem[]> = {};
      list.forEach((o, i) => { map[o.id] = results[i].data || []; });
      setOrderItems(map);
    } else {
      setOrderItems({});
    }
  }, []);

  useEffect(() => { fetchOrders(); fetchMenuPrepTimes(); }, [fetchOrders, fetchMenuPrepTimes]);

  useEffect(() => {
    const channel = supabase
      .channel('kds-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { fetchOrders(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  // Timer tick every 15s
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(interval);
  }, []);

  // Calculate estimated prep time for an order based on its items
  const getEstimatedPrepTime = useCallback((orderId: string): number => {
    const items = orderItems[orderId] || [];
    if (items.length === 0) return 15; // default
    let maxPrepTime = 0;
    items.forEach(item => {
      const prepTime = menuPrepTimes[item.item_name] || 15;
      // Use max prep time (parallel cooking) + extra per additional item
      maxPrepTime = Math.max(maxPrepTime, prepTime);
    });
    // Add 2 min per extra item beyond the first for overhead
    const extraItems = Math.max(0, items.reduce((s, i) => s + i.quantity, 0) - 1);
    return maxPrepTime + Math.min(extraItems * 2, 10);
  }, [orderItems, menuPrepTimes]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCompleted = completedOrders.filter(o =>
      new Date(o.updated_at) >= today && (o.status === 'delivered' || o.status === 'ready')
    );

    // Average completion time: difference between created_at and updated_at
    const completionTimes = todayCompleted.map(o =>
      differenceInMinutes(new Date(o.updated_at), new Date(o.created_at))
    ).filter(t => t > 0 && t < 120); // filter outliers

    const avgCompletionTime = completionTimes.length > 0
      ? Math.round(completionTimes.reduce((s, t) => s + t, 0) / completionTimes.length)
      : 0;

    const fastestTime = completionTimes.length > 0 ? Math.min(...completionTimes) : 0;
    const slowestTime = completionTimes.length > 0 ? Math.max(...completionTimes) : 0;

    // Current active orders average wait
    const activeWaitTimes = orders.map(o => differenceInMinutes(now, new Date(o.created_at)));
    const avgCurrentWait = activeWaitTimes.length > 0
      ? Math.round(activeWaitTimes.reduce((s, t) => s + t, 0) / activeWaitTimes.length)
      : 0;

    // Orders completed today
    const completedToday = todayCompleted.length;

    // On-time rate: orders completed within estimated prep time + 5min buffer
    const onTimeCount = todayCompleted.filter(o => {
      const completionTime = differenceInMinutes(new Date(o.updated_at), new Date(o.created_at));
      return completionTime <= 20; // 20 min benchmark
    }).length;
    const onTimeRate = completedToday > 0 ? Math.round((onTimeCount / completedToday) * 100) : 100;

    return { avgCompletionTime, fastestTime, slowestTime, avgCurrentWait, completedToday, onTimeRate };
  }, [completedOrders, orders, now]);

  const advanceOrder = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'preparing' : currentStatus === 'preparing' ? 'ready' : 'delivered';
    const { error } = await (supabase as any).from('orders').update({ status: nextStatus }).eq('id', orderId);
    if (error) { toast.error('Failed to update order'); return; }
    toast.success(`Order → ${nextStatus.toUpperCase()}`);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o).filter(o => KITCHEN_STATUSES.includes(o.status as any)));
  };

  const getElapsedMinutes = (createdAt: string) => differenceInMinutes(now, new Date(createdAt));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  };

  const grouped = {
    pending: orders.filter(o => o.status === 'pending'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready'),
  };

  return (
    <div className={`space-y-4 ${fullscreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : ''}`}>
      {/* KDS Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Kitchen Display</h2>
          <Badge variant="outline" className="text-xs">
            {orders.length} active order{orders.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Analytics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Avg Cook Time', value: `${analytics.avgCompletionTime}m`, icon: Timer, color: 'text-blue-600' },
          { label: 'Fastest Today', value: `${analytics.fastestTime}m`, icon: TrendingUp, color: 'text-green-600' },
          { label: 'Slowest Today', value: `${analytics.slowestTime}m`, icon: BarChart3, color: 'text-destructive' },
          { label: 'Avg Wait Now', value: `${analytics.avgCurrentWait}m`, icon: Clock, color: 'text-yellow-600' },
          { label: 'Completed Today', value: analytics.completedToday, icon: CheckCircle2, color: 'text-primary' },
          { label: 'On-Time Rate', value: `${analytics.onTimeRate}%`, icon: Gauge, color: analytics.onTimeRate >= 80 ? 'text-green-600' : 'text-destructive' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color} shrink-0`} />
            <div>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3-column lane layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[60vh]">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map(status => {
          const config = statusConfig[status];
          return (
            <div key={status} className="flex flex-col">
              {/* Lane header */}
              <div className={`rounded-t-xl px-4 py-3 ${config.bg} border ${config.border} border-b-0 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.badge}`}>{config.label}</span>
                  <span className="text-sm font-semibold text-foreground">{grouped[status].length}</span>
                </div>
                {status === 'pending' && grouped.pending.length > 0 && (
                  <Bell className="w-4 h-4 text-yellow-600 animate-bounce" />
                )}
              </div>

              {/* Lane body */}
              <div className={`flex-1 rounded-b-xl border ${config.border} border-t-0 bg-card/50 p-3 space-y-3 overflow-y-auto max-h-[70vh]`}>
                <AnimatePresence mode="popLayout">
                  {grouped[status].length === 0 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground py-12 text-sm">
                      No orders
                    </motion.p>
                  )}
                  {grouped[status].map(order => {
                    const elapsed = getElapsedMinutes(order.created_at);
                    const estimatedPrep = getEstimatedPrepTime(order.id);
                    const urgent = elapsed > estimatedPrep;
                    const progressPct = Math.min(100, Math.round((elapsed / estimatedPrep) * 100));
                    const items = orderItems[order.id] || [];

                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: 100 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className={`rounded-xl border-2 p-4 bg-card shadow-md ${
                          urgent ? 'border-destructive' : 'border-border'
                        }`}
                      >
                        {/* Order header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-foreground tracking-tight">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <div className={`flex items-center gap-1 text-xs font-medium ${urgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {elapsed}m
                          </div>
                        </div>

                        {/* Prep time estimate + progress bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Timer className="w-3 h-3" /> Est. {estimatedPrep}m
                            </span>
                            <span className={`font-semibold ${urgent ? 'text-destructive' : progressPct > 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {urgent ? `${elapsed - estimatedPrep}m over` : `${estimatedPrep - elapsed}m left`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                urgent ? 'bg-destructive' : progressPct > 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPct}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="space-y-1.5 mb-4">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-2">
                              <span className="text-xl font-bold text-primary w-8 text-center">{item.quantity}×</span>
                              <span className="text-sm font-medium text-foreground flex-1">{item.item_name}</span>
                              <span className="text-[10px] text-muted-foreground">{menuPrepTimes[item.item_name] || 15}m</span>
                            </div>
                          ))}
                          {items.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">No items loaded</p>
                          )}
                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <div className="bg-muted/50 rounded-lg px-3 py-2 mb-3">
                            <p className="text-xs text-muted-foreground font-medium">📝 {order.notes}</p>
                          </div>
                        )}

                        {/* Time + action */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            {format(new Date(order.created_at), 'HH:mm')}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => advanceOrder(order.id, order.status)}
                            className={`gap-1.5 font-semibold ${
                              status === 'pending' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                              status === 'preparing' ? 'bg-green-600 hover:bg-green-700 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}
                          >
                            {status === 'pending' && <><ChefHat className="w-4 h-4" /> Start</>}
                            {status === 'preparing' && <><CheckCircle2 className="w-4 h-4" /> Ready</>}
                            {status === 'ready' && <><CheckCircle2 className="w-4 h-4" /> Done</>}
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
