import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePrintReceipt } from './ReceiptPrinter';
import { Search, ShoppingCart, Plus, Minus, Trash2, Printer, Check } from 'lucide-react';

type MenuItem = {
  id: string; name: string; price: number; category_id: string | null;
  is_available: boolean; image_url: string | null;
};
type Category = { id: string; name: string };
type CartItem = { menuItem: MenuItem; quantity: number };

export default function AdminPOSTab() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const { printReceipt } = usePrintReceipt();

  useEffect(() => {
    const load = async () => {
      const [mRes, cRes] = await Promise.all([
        (supabase as any).from('menu_items').select('id, name, price, category_id, is_available, image_url').eq('is_available', true).order('name'),
        (supabase as any).from('menu_categories').select('id, name').order('sort_order'),
      ]);
      setMenuItems(mRes.data || []);
      setCategories(cRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return menuItems.filter(i => {
      const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'all' || i.category_id === activeCategory;
      return matchSearch && matchCat;
    });
  }, [menuItems, search, activeCategory]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.menuItem.id !== itemId) return c;
      const newQty = c.quantity + delta;
      return newQty > 0 ? { ...c, quantity: newQty } : c;
    }).filter(c => c.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  };

  const total = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setProcessing(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Not authenticated'); setProcessing(false); return; }

    // Create order
    const { data: order, error: orderErr } = await (supabase as any).from('orders').insert({
      user_id: user.id,
      total_amount: total,
      phone: customerPhone || 'Walk-in',
      delivery_address: 'In-store POS',
      status: 'ready',
      notes: 'POS Order',
    }).select().single();

    if (orderErr || !order) { toast.error('Failed to create order'); setProcessing(false); return; }

    // Create order items
    const items = cart.map(c => ({
      order_id: order.id,
      item_name: c.menuItem.name,
      item_price: c.menuItem.price,
      quantity: c.quantity,
    }));
    await (supabase as any).from('order_items').insert(items);

    toast.success('Order placed!');

    // Print receipt
    printReceipt(order, items.map((i, idx) => ({ ...i, id: `pos-${idx}` })));

    // Reset
    setCart([]);
    setCustomerPhone('');
    setProcessing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
      {/* Menu Grid */}
      <div className="lg:col-span-2 flex flex-col min-h-0">
        <div className="flex gap-2 mb-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>

        <div className="flex gap-1.5 mb-3 flex-wrap">
          <Button size="sm" variant={activeCategory === 'all' ? 'default' : 'outline'} className="text-xs h-8" onClick={() => setActiveCategory('all')}>All</Button>
          {categories.map(c => (
            <Button key={c.id} size="sm" variant={activeCategory === c.id ? 'default' : 'outline'} className="text-xs h-8" onClick={() => setActiveCategory(c.id)}>{c.name}</Button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? <p className="text-center text-muted-foreground py-8">Loading menu...</p> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-primary font-bold mt-1">TSh {Number(item.price).toLocaleString()}</p>
                </button>
              ))}
              {filtered.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No items found</p>}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <ShoppingCart className="w-4 h-4" /> Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">Tap items to add to cart</p>
              ) : (
                cart.map(c => (
                  <div key={c.menuItem.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{c.menuItem.name}</p>
                      <p className="text-xs text-muted-foreground">TSh {(c.menuItem.price * c.quantity).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQty(c.menuItem.id, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-bold w-6 text-center">{c.quantity}</span>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => updateQty(c.menuItem.id, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => removeFromCart(c.menuItem.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border pt-3 space-y-3">
              <Input
                placeholder="Customer phone (optional)"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="h-9 text-sm"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">TSh {total.toLocaleString()}</span>
              </div>
              <Button
                className="w-full gap-2"
                size="lg"
                disabled={cart.length === 0 || processing}
                onClick={placeOrder}
              >
                <Check className="w-4 h-4" />
                {processing ? 'Processing...' : 'Place Order & Print'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
