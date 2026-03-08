import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, AlertTriangle, Search, Save, Plus, Minus } from 'lucide-react';

type InventoryItem = {
  id: string;
  menu_item_id: string;
  stock_quantity: number;
  low_stock_threshold: number;
  item_name?: string;
};

export default function AdminInventoryTab() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState<Record<string, { stock_quantity?: number; low_stock_threshold?: number }>>({});
  const [stockModal, setStockModal] = useState<{ item: InventoryItem; mode: 'add' | 'remove' } | null>(null);
  const [stockAmount, setStockAmount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [invRes, menuRes] = await Promise.all([
      (supabase as any).from('inventory').select('*'),
      (supabase as any).from('menu_items').select('id, name').order('name'),
    ]);
    const items = menuRes.data || [];
    setMenuItems(items);

    const inv: InventoryItem[] = invRes.data || [];
    const enriched = inv.map(i => ({
      ...i,
      item_name: items.find((m: any) => m.id === i.menu_item_id)?.name || 'Unknown',
    }));

    const existingIds = new Set(inv.map((i: InventoryItem) => i.menu_item_id));
    const missing = items.filter((m: any) => !existingIds.has(m.id));
    if (missing.length > 0) {
      const inserts = missing.map((m: any) => ({ menu_item_id: m.id, stock_quantity: 100, low_stock_threshold: 10 }));
      await (supabase as any).from('inventory').insert(inserts);
      const { data: newInv } = await (supabase as any).from('inventory').select('*');
      const newEnriched = (newInv || []).map((i: InventoryItem) => ({
        ...i,
        item_name: items.find((m: any) => m.id === i.menu_item_id)?.name || 'Unknown',
      }));
      setInventory(newEnriched);
    } else {
      setInventory(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEdit = (id: string, field: string, value: number) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const saveItem = async (item: InventoryItem) => {
    const changes = edits[item.id];
    if (!changes) return;
    const { error } = await (supabase as any).from('inventory').update(changes).eq('id', item.id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success(`Updated ${item.item_name}`);
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, ...changes } : i));
    setEdits(prev => { const n = { ...prev }; delete n[item.id]; return n; });
  };

  const handleStockAdjust = async () => {
    if (!stockModal || stockAmount <= 0) return;
    const { item, mode } = stockModal;
    const newQty = mode === 'add'
      ? item.stock_quantity + stockAmount
      : Math.max(0, item.stock_quantity - stockAmount);

    const { error } = await (supabase as any).from('inventory').update({ stock_quantity: newQty }).eq('id', item.id);
    if (error) { toast.error('Failed to update stock'); return; }
    toast.success(`${mode === 'add' ? 'Added' : 'Removed'} ${stockAmount} units ${mode === 'add' ? 'to' : 'from'} ${item.item_name}`);
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, stock_quantity: newQty } : i));
    setStockModal(null);
    setStockAmount(0);
  };

  const filtered = inventory.filter(i =>
    !search || i.item_name?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = inventory.filter(i => i.stock_quantity <= i.low_stock_threshold);

  return (
    <div className="space-y-4">
      {lowStockItems.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="font-semibold text-destructive">Low Stock Alert — {lowStockItems.length} items</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(i => (
                <Badge key={i.id} variant="destructive" className="text-xs">
                  {i.item_name}: {i.stock_quantity} left
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="w-5 h-5" /> Inventory Management
              </CardTitle>
              <CardDescription>{inventory.length} items tracked</CardDescription>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading inventory...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Stock Qty</TableHead>
                    <TableHead>Low Stock Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(item => {
                    const currentQty = edits[item.id]?.stock_quantity ?? item.stock_quantity;
                    const currentThreshold = edits[item.id]?.low_stock_threshold ?? item.low_stock_threshold;
                    const isLow = currentQty <= currentThreshold;
                    const hasEdits = !!edits[item.id];

                    return (
                      <TableRow key={item.id} className={isLow ? 'bg-destructive/5' : ''}>
                        <TableCell className="font-medium">{item.item_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={currentQty}
                            onChange={e => handleEdit(item.id, 'stock_quantity', Number(e.target.value))}
                            className="w-20 h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={currentThreshold}
                            onChange={e => handleEdit(item.id, 'low_stock_threshold', Number(e.target.value))}
                            className="w-20 h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          {isLow ? (
                            <Badge variant="destructive" className="text-xs gap-1">
                              <AlertTriangle className="w-3 h-3" /> Low
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950"
                              onClick={() => { setStockModal({ item, mode: 'add' }); setStockAmount(0); }}
                              title="Add Stock"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => { setStockModal({ item, mode: 'remove' }); setStockAmount(0); }}
                              title="Remove Stock"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                            {hasEdits && (
                              <Button size="sm" variant="ghost" onClick={() => saveItem(item)} className="h-7 w-7 p-0">
                                <Save className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Modal */}
      <Dialog open={!!stockModal} onOpenChange={(open) => { if (!open) setStockModal(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {stockModal?.mode === 'add' ? (
                <Plus className="w-5 h-5 text-green-600" />
              ) : (
                <Minus className="w-5 h-5 text-red-600" />
              )}
              {stockModal?.mode === 'add' ? 'Add Stock' : 'Remove Stock'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {stockModal?.mode === 'add' ? 'Adding stock to' : 'Removing stock from'}{' '}
              <span className="font-semibold text-foreground">{stockModal?.item.item_name}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Current stock: <span className="font-semibold text-foreground">{stockModal?.item.stock_quantity}</span>
            </p>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                max={stockModal?.mode === 'remove' ? stockModal.item.stock_quantity : undefined}
                value={stockAmount || ''}
                onChange={e => setStockAmount(Number(e.target.value))}
                placeholder="Enter amount..."
                autoFocus
              />
            </div>
            {stockAmount > 0 && stockModal && (
              <p className="text-sm">
                New stock will be:{' '}
                <span className="font-bold">
                  {stockModal.mode === 'add'
                    ? stockModal.item.stock_quantity + stockAmount
                    : Math.max(0, stockModal.item.stock_quantity - stockAmount)}
                </span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockModal(null)}>Cancel</Button>
            <Button
              onClick={handleStockAdjust}
              disabled={stockAmount <= 0}
              className={stockModal?.mode === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {stockModal?.mode === 'add' ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
