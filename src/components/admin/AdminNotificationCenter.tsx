import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Bell, ShoppingBag, AlertTriangle, UserPlus } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';

type Notification = {
  id: string;
  type: 'order' | 'low_stock' | 'new_customer';
  title: string;
  description: string;
  time: Date;
  read: boolean;
};

export default function AdminNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const buildNotifications = useCallback(async () => {
    const notifs: Notification[] = [];

    // Pending orders
    const { data: orders } = await (supabase as any).from('orders').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(10);
    (orders || []).forEach((o: any) => {
      const waitMins = differenceInMinutes(new Date(), new Date(o.created_at));
      notifs.push({
        id: `order-${o.id}`,
        type: 'order',
        title: `Pending Order #${o.id.slice(0, 6)}`,
        description: `TSh ${Number(o.total_amount).toLocaleString()} — waiting ${waitMins}m`,
        time: new Date(o.created_at),
        read: false,
      });
    });

    // Low stock
    const { data: inventory } = await (supabase as any).from('inventory').select('*, menu_items(name)');
    (inventory || []).forEach((i: any) => {
      if (i.stock_quantity <= i.low_stock_threshold) {
        notifs.push({
          id: `stock-${i.id}`,
          type: 'low_stock',
          title: `Low Stock: ${i.menu_items?.name || 'Unknown'}`,
          description: `Only ${i.stock_quantity} remaining (threshold: ${i.low_stock_threshold})`,
          time: new Date(i.updated_at),
          read: false,
        });
      }
    });

    // Recent signups (last 24h)
    const { data: profiles } = await (supabase as any).from('profiles').select('*').order('created_at', { ascending: false }).limit(5);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    (profiles || []).forEach((p: any) => {
      if (new Date(p.created_at) > oneDayAgo) {
        notifs.push({
          id: `customer-${p.id}`,
          type: 'new_customer',
          title: `New Customer`,
          description: p.full_name || 'Anonymous user signed up',
          time: new Date(p.created_at),
          read: false,
        });
      }
    });

    notifs.sort((a, b) => b.time.getTime() - a.time.getTime());
    setNotifications(notifs);
  }, []);

  useEffect(() => {
    buildNotifications();
    const interval = setInterval(buildNotifications, 30000);
    return () => clearInterval(interval);
  }, [buildNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const iconForType = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-primary" />;
      case 'low_stock': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'new_customer': return <UserPlus className="w-4 h-4 text-green-600" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
          <p className="text-xs text-muted-foreground">{unreadCount} new alerts</p>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">All clear! 🎉</p>
          ) : (
            notifications.slice(0, 20).map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <div className="mt-0.5">{iconForType(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{format(n.time, 'HH:mm')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
