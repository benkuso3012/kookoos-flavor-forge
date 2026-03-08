import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Search, CheckSquare, XSquare } from 'lucide-react';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category_id: string | null;
  is_available: boolean;
  is_featured: boolean;
  is_spicy: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  calories: number | null;
  rating: number;
  prep_time: number;
  description: string | null;
  image_url: string | null;
};

interface AdminMenuTabProps {
  menuItems: MenuItem[];
  onOpenCreate: () => void;
  onOpenEdit: (item: MenuItem) => void;
  onToggleAvailability: (id: string, available: boolean) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onRefresh: () => void;
}

export default function AdminMenuTab({
  menuItems, onOpenCreate, onOpenEdit, onToggleAvailability, onToggleFeatured, onRefresh
}: AdminMenuTabProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filtered = menuItems.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(i => i.id)));
    }
  };

  const bulkSetAvailability = async (available: boolean) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const { error } = await (supabase as any).from('menu_items').update({ is_available: available }).in('id', ids);
    if (error) { toast.error('Bulk update failed'); return; }
    toast.success(`${ids.length} items set to ${available ? 'available' : 'unavailable'}`);
    setSelected(new Set());
    onRefresh();
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} items? This cannot be undone.`)) return;
    const { error } = await (supabase as any).from('menu_items').delete().in('id', ids);
    if (error) { toast.error('Bulk delete failed'); return; }
    toast.success(`${ids.length} items deleted`);
    setSelected(new Set());
    onRefresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-foreground">Menu Management</CardTitle>
          <CardDescription>{menuItems.length} items total</CardDescription>
        </div>
        <Button onClick={onOpenCreate} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </CardHeader>
      <CardContent>
        {/* Search & Bulk Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search menu items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          {selected.size > 0 && (
            <div className="flex gap-2 items-center">
              <Badge variant="secondary">{selected.size} selected</Badge>
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => bulkSetAvailability(true)}>
                <CheckSquare className="w-3.5 h-3.5" /> Enable
              </Button>
              <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => bulkSetAvailability(false)}>
                <XSquare className="w-3.5 h-3.5" /> Disable
              </Button>
              <Button size="sm" variant="destructive" className="text-xs gap-1" onClick={bulkDelete}>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onCheckedChange={selectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Prep Time</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id} className={selected.has(item.id) ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>TSh {Number(item.price).toLocaleString()}</TableCell>
                  <TableCell>{item.rating} ⭐</TableCell>
                  <TableCell>{item.prep_time} min</TableCell>
                  <TableCell>
                    <Button
                      variant={item.is_available ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => onToggleAvailability(item.id, item.is_available)}
                    >
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={item.is_featured ? 'default' : 'ghost'}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => onToggleFeatured(item.id, item.is_featured)}
                    >
                      {item.is_featured ? '⭐ Featured' : 'Set Featured'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onOpenEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No items found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
