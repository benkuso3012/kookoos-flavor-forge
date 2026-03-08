import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Percent, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type DailySpecial = {
  id: string;
  title: string;
  description: string | null;
  discount_percent: number;
  special_price: number | null;
  day_of_week: number | null;
  is_active: boolean;
  menu_item_id: string | null;
};

type MenuItem = { id: string; name: string; price: number };

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminDailySpecialsTab() {
  const [specials, setSpecials] = useState<DailySpecial[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSpecial, setEditSpecial] = useState<DailySpecial | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSpecials = useCallback(async () => {
    const { data } = await (supabase as any).from('daily_specials').select('*').order('day_of_week');
    setSpecials(data || []);
  }, []);

  const fetchMenuItems = useCallback(async () => {
    const { data } = await (supabase as any).from('menu_items').select('id, name, price').order('name');
    setMenuItems(data || []);
  }, []);

  useEffect(() => {
    fetchSpecials();
    fetchMenuItems();
  }, [fetchSpecials, fetchMenuItems]);

  const openCreate = () => { setEditSpecial(null); setModalOpen(true); };
  const openEdit = (s: DailySpecial) => { setEditSpecial(s); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get('title') as string,
      description: (fd.get('description') as string) || null,
      discount_percent: Number(fd.get('discount_percent') || 0),
      special_price: fd.get('special_price') ? Number(fd.get('special_price')) : null,
      day_of_week: fd.get('day_of_week') && fd.get('day_of_week') !== 'any' ? Number(fd.get('day_of_week')) : null,
      menu_item_id: (fd.get('menu_item_id') as string) || null,
      is_active: true,
    };

    let error;
    if (editSpecial) {
      ({ error } = await (supabase as any).from('daily_specials').update(payload).eq('id', editSpecial.id));
    } else {
      ({ error } = await (supabase as any).from('daily_specials').insert(payload));
    }

    if (error) {
      toast.error('Failed to save special');
    } else {
      toast.success(editSpecial ? 'Special updated' : 'Special created');
      setModalOpen(false);
      fetchSpecials();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await (supabase as any).from('daily_specials').update({ is_active: !active }).eq('id', id);
    if (error) { toast.error('Failed to update'); return; }
    setSpecials(prev => prev.map(s => s.id === id ? { ...s, is_active: !active } : s));
  };

  const deleteSpecial = async (id: string) => {
    const { error } = await (supabase as any).from('daily_specials').delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Special deleted');
    setSpecials(prev => prev.filter(s => s.id !== id));
  };

  const todayIdx = new Date().getDay();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Daily Specials</CardTitle>
            <CardDescription>Manage promotions and daily deals. Today is <strong>{DAYS[todayIdx]}</strong>.</CardDescription>
          </div>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Special
          </Button>
        </CardHeader>
        <CardContent>
          {specials.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No specials yet — create one to attract customers!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Special Price</TableHead>
                    <TableHead>Linked Item</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specials.map(special => {
                    const linkedItem = menuItems.find(m => m.id === special.menu_item_id);
                    const isToday = special.day_of_week === null || special.day_of_week === todayIdx;
                    return (
                      <TableRow key={special.id} className={!special.is_active ? 'opacity-50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{special.title}</span>
                            {isToday && special.is_active && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px]">TODAY</Badge>
                            )}
                          </div>
                          {special.description && <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">{special.description}</p>}
                        </TableCell>
                        <TableCell className="text-sm">
                          {special.day_of_week !== null ? DAYS[special.day_of_week] : <Badge variant="secondary" className="text-xs">Every day</Badge>}
                        </TableCell>
                        <TableCell>
                          {special.discount_percent > 0 && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100 gap-0.5">
                              <Percent className="w-3 h-3" /> {special.discount_percent}% off
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {special.special_price ? `TSh ${Number(special.special_price).toLocaleString()}` : '—'}
                        </TableCell>
                        <TableCell className="text-sm">{linkedItem ? linkedItem.name : '—'}</TableCell>
                        <TableCell>
                          <Switch checked={special.is_active} onCheckedChange={() => toggleActive(special.id, special.is_active)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(special)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteSpecial(special.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

      {/* Special Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editSpecial ? 'Edit Special' : 'Create Special'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" defaultValue={editSpecial?.title || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={editSpecial?.description || ''} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="discount_percent">Discount %</Label>
                <Input id="discount_percent" name="discount_percent" type="number" min={0} max={100} defaultValue={editSpecial?.discount_percent || 0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="special_price">Special Price (TSh)</Label>
                <Input id="special_price" name="special_price" type="number" min={0} defaultValue={editSpecial?.special_price || ''} placeholder="Optional" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="day_of_week">Day of Week</Label>
              <Select name="day_of_week" defaultValue={editSpecial?.day_of_week !== null && editSpecial?.day_of_week !== undefined ? String(editSpecial.day_of_week) : 'any'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Every day</SelectItem>
                  {DAYS.map((d, i) => (
                    <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu_item_id">Linked Menu Item</Label>
              <Select name="menu_item_id" defaultValue={editSpecial?.menu_item_id || 'none'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {menuItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name} — TSh {Number(item.price).toLocaleString()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editSpecial ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
