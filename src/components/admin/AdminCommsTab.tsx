import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MessageSquare, Phone, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type Order = {
  id: string; status: string; total_amount: number;
  phone: string; created_at: string; user_id: string;
};

interface AdminCommsTabProps {
  orders: Order[];
}

const STATUS_MESSAGES: Record<string, string> = {
  pending: 'Habari! Your order #{id} has been received. We are processing it now. Asante! 🍗',
  preparing: 'Great news! Your order #{id} is now being prepared. It will be ready soon! 🔥',
  ready: 'Your order #{id} is READY for pickup/delivery! 🎉',
  delivered: 'Your order #{id} has been delivered. Enjoy your meal! Asante sana! 🙏',
  cancelled: 'Sorry, your order #{id} has been cancelled. Please contact us for assistance.',
};

export default function AdminCommsTab({ orders }: AdminCommsTabProps) {
  const [msgModal, setMsgModal] = useState<{ order: Order; message: string } | null>(null);

  const recentOrders = orders.slice(0, 20);

  const openMessage = (order: Order) => {
    const template = STATUS_MESSAGES[order.status] || STATUS_MESSAGES.pending;
    const message = template.replace('#{id}', `#${order.id.slice(0, 8).toUpperCase()}`);
    setMsgModal({ order, message });
  };

  const sendWhatsApp = () => {
    if (!msgModal) return;
    const phone = msgModal.order.phone.replace(/\D/g, '');
    const intlPhone = phone.startsWith('0') ? `255${phone.slice(1)}` : phone;
    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(msgModal.message)}`;
    window.open(url, '_blank');
    toast.success('WhatsApp opened');
    setMsgModal(null);
  };

  const sendSMS = () => {
    if (!msgModal) return;
    const url = `sms:${msgModal.order.phone}?body=${encodeURIComponent(msgModal.message)}`;
    window.open(url, '_self');
    toast.success('SMS app opened');
    setMsgModal(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Customer Communication
          </CardTitle>
          <p className="text-sm text-muted-foreground">Send order updates via WhatsApp or SMS to customers</p>
        </CardHeader>
        <CardContent>
          {/* Quick Templates */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">📋 Message Templates (auto-filled based on order status)</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_MESSAGES).map(([status, msg]) => (
                <Badge key={status} variant="outline" className="text-xs capitalize">{status}</Badge>
              ))}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Send</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">#{order.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-muted-foreground">{order.phone}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize text-xs">{order.status}</Badge></TableCell>
                  <TableCell className="font-medium">TSh {Number(order.total_amount).toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{format(new Date(order.created_at), 'MMM d, HH:mm')}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => openMessage(order)}>
                      <Send className="w-3.5 h-3.5" /> Message
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {recentOrders.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Message Modal */}
      <Dialog open={!!msgModal} onOpenChange={(open) => { if (!open) setMsgModal(null); }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" /> Send Message
            </DialogTitle>
          </DialogHeader>
          {msgModal && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{msgModal.order.phone}</span>
                <Badge variant="secondary" className="capitalize text-xs">{msgModal.order.status}</Badge>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  value={msgModal.message}
                  onChange={e => setMsgModal(prev => prev ? { ...prev, message: e.target.value } : null)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setMsgModal(null)}>Cancel</Button>
            <Button onClick={sendSMS} variant="secondary" className="gap-1.5">
              <Phone className="w-4 h-4" /> Send SMS
            </Button>
            <Button onClick={sendWhatsApp} className="gap-1.5 bg-green-600 hover:bg-green-700">
              <MessageSquare className="w-4 h-4" /> WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
