import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Store = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  hours: string | null;
  is_active: boolean;
  is_flagship: boolean;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  store: Store | null;
  onSaved: () => void;
};

export default function StoreModal({ open, onClose, store, onSaved }: Props) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    hours: '',
    is_active: true,
    is_flagship: false,
    latitude: '',
    longitude: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name,
        address: store.address,
        phone: store.phone || '',
        hours: store.hours || '',
        is_active: store.is_active,
        is_flagship: store.is_flagship,
        latitude: store.latitude?.toString() || '',
        longitude: store.longitude?.toString() || '',
      });
    } else {
      setForm({ name: '', address: '', phone: '', hours: '', is_active: true, is_flagship: false, latitude: '', longitude: '' });
    }
  }, [store, open]);

  const handleSave = async () => {
    if (!form.name || !form.address) {
      toast.error('Name and address are required');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      address: form.address,
      phone: form.phone || null,
      hours: form.hours || null,
      is_active: form.is_active,
      is_flagship: form.is_flagship,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    };

    const query = store
      ? (supabase as any).from('stores').update(payload).eq('id', store.id)
      : (supabase as any).from('stores').insert(payload);

    const { error } = await query;
    setSaving(false);
    if (error) {
      toast.error('Failed to save store');
      return;
    }
    toast.success(store ? 'Store updated' : 'Store created');
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{store ? 'Edit Store' : 'Add Store'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>Address *</Label>
            <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Hours</Label>
              <Input value={form.hours} onChange={(e) => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="e.g. 9AM-10PM" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Latitude</Label>
              <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm(f => ({ ...f, latitude: e.target.value }))} />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm(f => ({ ...f, longitude: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Flagship Store</Label>
            <Switch checked={form.is_flagship} onCheckedChange={(v) => setForm(f => ({ ...f, is_flagship: v }))} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving…' : store ? 'Update Store' : 'Create Store'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
