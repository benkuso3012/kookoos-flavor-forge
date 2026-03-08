import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInMinutes } from 'date-fns';
import { ChevronDown, ChevronUp, Phone, MapPin, StickyNote, Package, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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

type OrderItem = {
  id: string;
  item_name: string;
  item_price: number;
  quantity: number;
};

interface AdminOrdersTabProps {
  orders: Order[];
  statusColor: (status: string) => string;
  updateOrderStatus: (orderId: string, status: string) => void;
}

export default function AdminOrdersTab({ orders, statusColor, updateOrderStatus }: AdminOrdersTabProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);

    if (!orderItems[orderId]) {
      setLoadingItems(orderId);
      const { data, error } = await (supabase as any)
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      if (!error && data) {
        setOrderItems(prev => ({ ...prev, [orderId]: data }));
      }
      setLoadingItems(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Order Management</CardTitle>
        <CardDescription>Click any order to see full details including items ordered</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, address, or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'] as const).map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-9 gap-1"
                onClick={() => setFilterStatus(status)}
              >
                <span className="capitalize">{status}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 min-w-[18px]">
                  {statusCounts[status]}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredOrders.map(order => {
              const isExpanded = expandedOrder === order.id;
              const waitMins = differenceInMinutes(new Date(), new Date(order.created_at));
              const items = orderItems[order.id];

              return (
                <motion.div
                  key={order.id}
                  layout
                  className={`border rounded-lg overflow-hidden transition-colors ${isExpanded ? 'border-primary/30 bg-card' : 'border-border hover:border-primary/20'}`}
                >
                  {/* Order Row */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-muted-foreground w-20 shrink-0">#{order.id.slice(0, 8)}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{format(new Date(order.created_at), 'MMM d, HH:mm')}</span>
                      <span className="font-semibold text-foreground shrink-0">TSh {Number(order.total_amount).toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.status === 'pending' && waitMins > 10 && (
                        <Badge variant="destructive" className="text-[10px] h-5 shrink-0">
                          {waitMins}m wait
                        </Badge>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 space-y-4">
                          {/* Customer Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Delivery Address</p>
                                <p className="text-sm text-foreground">{order.delivery_address}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Phone</p>
                                <p className="text-sm text-foreground">{order.phone}</p>
                              </div>
                            </div>
                            {order.notes && (
                              <div className="flex items-start gap-2">
                                <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground font-medium">Notes</p>
                                  <p className="text-sm text-foreground">{order.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Order Items */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground font-medium">Order Items</p>
                            </div>
                            {loadingItems === order.id ? (
                              <p className="text-xs text-muted-foreground py-2">Loading items...</p>
                            ) : items && items.length > 0 ? (
                              <div className="bg-muted/50 rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                      <TableHead className="text-xs h-8">Item</TableHead>
                                      <TableHead className="text-xs h-8 text-right">Qty</TableHead>
                                      <TableHead className="text-xs h-8 text-right">Price</TableHead>
                                      <TableHead className="text-xs h-8 text-right">Subtotal</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {items.map(item => (
                                      <TableRow key={item.id} className="hover:bg-transparent">
                                        <TableCell className="text-sm py-2 font-medium">{item.item_name}</TableCell>
                                        <TableCell className="text-sm py-2 text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-sm py-2 text-right">TSh {Number(item.item_price).toLocaleString()}</TableCell>
                                        <TableCell className="text-sm py-2 text-right font-medium">TSh {(Number(item.item_price) * item.quantity).toLocaleString()}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground py-2">No items found for this order</p>
                            )}
                          </div>

                          {/* Status Update */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="text-xs text-muted-foreground">
                              Placed {format(new Date(order.created_at), 'EEEE, MMM d yyyy \'at\' HH:mm')} ({waitMins} min ago)
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Update status:</span>
                              <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                                <SelectTrigger className="w-[140px] h-8 text-xs">
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
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
