import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPinned, Plus, Search, Pencil, Trash2 } from 'lucide-react';

type Store = { id: string; name: string };
type DeliveryZone = {
  id: string; store_id: string | null; zone_name: string;
  delivery_fee: number; estimated_time: string | null; is_active: boolean;
};

export default function AdminDeliveryZonesTab() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState({ store_id: '', zone_name: '', delivery_fee: 2000, estimated_time: '', is_active: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [zRes, sRes] = await Promise.all([
      (supabase as any).from('delivery_zones').select('*').order('zone_name'),
      (supabase as any).from('stores').select('id, name').order('name'),
    ]);
    setZones(zRes.data || []);
    setStores(sRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const storeName = (id: string | null) => stores.find(s => s.id === id)?.name || 'All Stores';

  const openCreate = () => {
    setEditing(null);
    setForm({ store_id: '', zone_name: '', delivery_fee: 2000, estimated_time: '', is_active: true });
    setModalOpen(true);
  };

  const openEdit = (z: DeliveryZone) => {
    setEditing(z);
    setForm({ store_id: z.store_id || '', zone_name: z.zone_name, delivery_fee: z.delivery_fee, estimated_time: z.estimated_time || '', is_active: z.is_active });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.zone_name.trim()) { toast.error('Zone name is required'); return; }
    const payload = {
      store_id: form.store_id || null, zone_name: form.zone_name,
      delivery_fee: form.delivery_fee, estimated_time: form.estimated_time || null,
      is_active: form.is_active,
    };
    if (editing) {
      const { error } = await (supabase as any).from('delivery_zones').update(payload).eq('id', editing.id);
      if (error) { toast.error('Failed to update'); return; }
      toast.success('Zone updated');
    } else {
      const { error } = await (supabase as any).from('delivery_zones').insert(payload);
      if (error) { toast.error('Failed to create'); return; }
      toast.success('Zone created');
    }
    setModalOpen(false); fetchData();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this delivery zone?')) return;
    await (supabase as any).from('delivery_zones').delete().eq('id', id);
    toast.success('Zone deleted'); fetchData();
  };

  const filtered = zones.filter(z => !search || z.zone_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={openCreate} className="gap-1.5"><Plus className="w-4 h-4" /> Add Zone</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2"><MapPinned className="w-5 h-5" /> Delivery Zone Management</CardTitle>
          <CardDescription>{zones.length} delivery zones configured</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search zones..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone Name</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Delivery Fee</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(z => (
                  <TableRow key={z.id} className={!z.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{z.zone_name}</TableCell>
                    <TableCell className="text-muted-foreground">{storeName(z.store_id)}</TableCell>
                    <TableCell className="font-medium">TSh {Number(z.delivery_fee).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{z.estimated_time || '—'}</TableCell>
                    <TableCell><Badge variant={z.is_active ? 'default' : 'secondary'}>{z.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(z)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(z.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No zones found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Zone' : 'Add Delivery Zone'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Zone Name *</Label><Input placeholder="e.g. Bahari Beach Area" value={form.zone_name} onChange={e => setForm(f => ({ ...f, zone_name: e.target.value }))} /></div>
            <div>
              <Label>Store</Label>
              <Select value={form.store_id || '__all__'} onValueChange={v => setForm(f => ({ ...f, store_id: v === '__all__' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="All Stores" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Stores</SelectItem>
                  {stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Delivery Fee (TSh)</Label><Input type="number" min={0} value={form.delivery_fee} onChange={e => setForm(f => ({ ...f, delivery_fee: Number(e.target.value) }))} /></div>
              <div><Label>Est. Delivery Time</Label><Input placeholder="e.g. 30-45 min" value={form.estimated_time} onChange={e => setForm(f => ({ ...f, estimated_time: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
