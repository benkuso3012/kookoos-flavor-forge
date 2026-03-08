import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, AlertTriangle, Search, Save } from 'lucide-react';

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

    // Auto-create inventory records for items without one
    const existingIds = new Set(inv.map((i: InventoryItem) => i.menu_item_id));
    const missing = items.filter((m: any) => !existingIds.has(m.id));
    if (missing.length > 0) {
      const inserts = missing.map((m: any) => ({ menu_item_id: m.id, stock_quantity: 100, low_stock_threshold: 10 }));
      await (supabase as any).from('inventory').insert(inserts);
      // Re-fetch
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
                    <TableHead>Save</TableHead>
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
                          {hasEdits && (
                            <Button size="sm" variant="ghost" onClick={() => saveItem(item)}>
                              <Save className="w-4 h-4" />
                            </Button>
                          )}
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
    </div>
  );
}
