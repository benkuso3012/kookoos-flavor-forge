import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Plus, Trash2, Search } from 'lucide-react';

type UserRole = {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
};

type Profile = {
  id: string;
  full_name: string | null;
};

export default function AdminRolesTab() {
  const [roles, setRoles] = useState<(UserRole & { full_name?: string | null })[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<string>('user');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [rolesRes, profilesRes] = await Promise.all([
      (supabase as any).from('user_roles').select('*'),
      (supabase as any).from('profiles').select('id, full_name'),
    ]);
    const allRoles: UserRole[] = rolesRes.data || [];
    const allProfiles: Profile[] = profilesRes.data || [];
    setProfiles(allProfiles);

    const enriched = allRoles.map(r => ({
      ...r,
      full_name: allProfiles.find(p => p.id === r.user_id)?.full_name,
    }));
    setRoles(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addRole = async () => {
    if (!newUserId.trim()) { toast.error('Please select a user'); return; }
    const existing = roles.find(r => r.user_id === newUserId && r.role === newRole);
    if (existing) { toast.error('User already has this role'); return; }

    const { error } = await (supabase as any).from('user_roles').insert({
      user_id: newUserId,
      role: newRole,
    });
    if (error) { toast.error('Failed to add role: ' + error.message); return; }
    toast.success('Role assigned');
    setModalOpen(false);
    setNewUserId('');
    fetchData();
  };

  const removeRole = async (roleId: string) => {
    const { error } = await (supabase as any).from('user_roles').delete().eq('id', roleId);
    if (error) { toast.error('Failed to remove role'); return; }
    toast.success('Role removed');
    setRoles(prev => prev.filter(r => r.id !== roleId));
  };

  const filtered = roles.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.full_name?.toLowerCase().includes(q) || r.user_id.includes(q) || r.role.includes(q);
  });

  const roleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5" /> Role Management
            </CardTitle>
            <CardDescription>{roles.length} role assignments</CardDescription>
          </div>
          <Button onClick={() => setModalOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Assign Role
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.full_name || <span className="text-muted-foreground italic">Unknown</span>}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.user_id.slice(0, 12)}...</TableCell>
                      <TableCell>
                        <Badge className={roleColor(r.role)}>{r.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeRole(r.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No roles found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={newUserId} onValueChange={setNewUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name || 'Anonymous'} ({p.id.slice(0, 8)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={addRole}>Assign Role</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
