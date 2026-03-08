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
import { UserCog, Plus, Search, Pencil, Trash2 } from 'lucide-react';

type Staff = {
  id: string; user_id: string | null; full_name: string; role: string;
  phone: string | null; email: string | null; is_active: boolean;
  shift_schedule: string | null;
};

export default function AdminStaffTab() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState({ full_name: '', role: 'cashier', phone: '', email: '', shift_schedule: '', is_active: true });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('staff').select('*').order('full_name');
    setStaff(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const openCreate = () => { setEditing(null); setForm({ full_name: '', role: 'cashier', phone: '', email: '', shift_schedule: '', is_active: true }); setModalOpen(true); };
  const openEdit = (s: Staff) => {
    setEditing(s);
    setForm({ full_name: s.full_name, role: s.role, phone: s.phone || '', email: s.email || '', shift_schedule: s.shift_schedule || '', is_active: s.is_active });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.full_name.trim()) { toast.error('Name is required'); return; }
    const payload = { ...form, phone: form.phone || null, email: form.email || null, shift_schedule: form.shift_schedule || null };
    if (editing) {
      const { error } = await (supabase as any).from('staff').update(payload).eq('id', editing.id);
      if (error) { toast.error('Failed to update'); return; }
      toast.success('Staff updated');
    } else {
      const { error } = await (supabase as any).from('staff').insert(payload);
      if (error) { toast.error('Failed to create'); return; }
      toast.success('Staff added');
    }
    setModalOpen(false); fetchStaff();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this staff member?')) return;
    await (supabase as any).from('staff').delete().eq('id', id);
    toast.success('Staff removed'); fetchStaff();
  };

  const roleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'default';
      case 'cashier': return 'secondary';
      case 'chef': return 'outline';
      case 'delivery': return 'secondary';
      default: return 'secondary';
    }
  };

  const filtered = staff.filter(s => !search || s.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={openCreate} className="gap-1.5"><Plus className="w-4 h-4" /> Add Staff</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2"><UserCog className="w-5 h-5" /> Staff Management</CardTitle>
          <CardDescription>{staff.length} staff members</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center text-muted-foreground py-8">Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className={!s.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell><Badge variant={roleColor(s.role) as any} className="capitalize">{s.role}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{s.phone || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{s.shift_schedule || '—'}</TableCell>
                    <TableCell><Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(s.id)} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No staff found</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Staff' : 'Add Staff'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="chef">Chef</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>
            <div><Label>Shift Schedule</Label><Input placeholder="e.g. Mon-Fri 8AM-4PM" value={form.shift_schedule} onChange={e => setForm(f => ({ ...f, shift_schedule: e.target.value }))} /></div>
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
