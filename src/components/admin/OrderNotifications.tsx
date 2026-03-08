import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Props = {
  onNewOrder: () => void;
};

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'kookoos-order',
        requireInteraction: true,
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      // Silent fail for environments that don't support notifications
    }
  }
}

export default function OrderNotifications({ onNewOrder }: Props) {
  const mounted = useRef(true);

  useEffect(() => {
    // Request browser notification permission on mount
    requestNotificationPermission();
  }, []);

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
          const amount = `TSh ${Number(order.total_amount).toLocaleString()}`;
          const orderId = order.id?.slice(0, 6);

          // In-app toast
          toast.info(`🔔 New Order #${orderId}`, {
            description: `${amount} — ${order.delivery_address}`,
            duration: 8000,
          });

          // Browser push notification
          sendBrowserNotification(
            `🍗 New Order #${orderId}`,
            `${amount} — ${order.delivery_address}`
          );

          // Play notification sound
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRl9vT19teleW5v');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch (e) {}

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
