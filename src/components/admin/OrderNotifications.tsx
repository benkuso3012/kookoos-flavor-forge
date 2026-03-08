import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Props = {
  onNewOrder: () => void;
};

export default function OrderNotifications({ onNewOrder }: Props) {
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (!mounted.current) return;
          const order = payload.new as any;
          toast.info(`🔔 New Order #${order.id?.slice(0, 6)}`, {
            description: `TSh ${Number(order.total_amount).toLocaleString()} — ${order.delivery_address}`,
            duration: 8000,
          });
          onNewOrder();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => {
          if (!mounted.current) return;
          onNewOrder();
        }
      )
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [onNewOrder]);

  return null; // headless component
}
