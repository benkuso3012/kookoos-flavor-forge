import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Gift, Plus, Search, Pencil, Trash2, Copy } from 'lucide-react';

type Promotion = {
  id: string; code: string; title: string; description: string | null;
  discount_type: string; discount_value: number; min_order_amount: number;
  max_uses: number | null; current_uses: number; is_active: boolean;
  starts_at: string; expires_at: string | null;
};

export default function AdminPromotionsTab() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({
    code: '', title: '', description: '', discount_type: 'percentage',
    discount_value: 10, min_order_amount: 0, max_uses: '',
    is_active: true, expires_at: '',
  });

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('promotions').select('*').order('created_at', { ascending: false });
    setPromos(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  const openCreate = () => {
    setEditing(null);
    const randomCode = 'KOOKOOS' + Math.random().toString(36).substring(2, 6).toUpperCase();
    setForm({ code: randomCode, title: '', description: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_uses: '', is_active: true, expires_at: '' });
    setModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      code: p.code, title: p.title, description: p.description || '',
      discount_type: p.discount_type, discount_value: p.discount_value,
      min_order_amount: p.min_order_amount || 0,
      max_uses: p.max_uses ? String(p.max_uses) : '',
      is_active: p.is_active,
      expires_at: p.expires_at ? format(new Date(p.expires_at), "yyyy-MM-dd'T'HH:mm") : '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.code.trim() || !form.title.trim()) { toast.error('Code and title are required'); return; }
    const payload = {
      code: form.code.toUpperCase(), title: form.title,
      description: form.description || null, discount_type: form.discount_type,
      discount_value: form.discount_value, min_order_amount: form.min_order_amount,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: form.is_active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };
    if (editing) {
      const { error } = await (supabase as any).from('promotions').update(payload).eq('id', editing.id);
      if (error) { toast.error('Failed to update'); return; }
      toast.success('Promotion updated');
    } else {
      const { error } = await (supabase as any).from('promotions').insert(payload);
      if (error) { toast.error(error.message?.includes('unique') ? 'Code already exists' : 'Failed to create'); return; }
      toast.success('Promotion created');
    }
    setModalOpen(false); fetchPromos();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this promotion?')) return;
    await (supabase as any).from('promotions').delete().eq('id', id);
    toast.success('Promotion deleted'); fetchPromos();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const filtered = promos.filter(p => !search || p.code.toLowerCase().includes(search.toLowerCase()) || p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={openCreate} className="gap-1.5"><Plus className="w-4 h-4" /> Create Promotion</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2"><Gift className="w-5 h-5" /> Promotions & Coupons</CardTitle>
          <CardDescription>{promos.length} promotions</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by code or title..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{p.code}</code>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyCode(p.code)}><Copy className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.discount_type === 'percentage' ? `${p.discount_value}%` : `TSh ${Number(p.discount_value).toLocaleString()}`}</TableCell>
                      <TableCell className="text-muted-foreground">{p.min_order_amount ? `TSh ${Number(p.min_order_amount).toLocaleString()}` : '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{p.current_uses}{p.max_uses ? `/${p.max_uses}` : ''}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{p.expires_at ? format(new Date(p.expires_at), 'MMM d, yyyy') : 'Never'}</TableCell>
                      <TableCell><Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => remove(p.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No promotions found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="font-mono" /></div>
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Discount Type</Label>
                <Select value={form.discount_type} onValueChange={v => setForm(f => ({ ...f, discount_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (TSh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Discount Value</Label><Input type="number" min={0} value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Min Order (TSh)</Label><Input type="number" min={0} value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: Number(e.target.value) }))} /></div>
              <div><Label>Max Uses</Label><Input type="number" min={0} placeholder="Unlimited" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} /></div>
            </div>
            <div><Label>Expires At</Label><Input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} /></div>
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
