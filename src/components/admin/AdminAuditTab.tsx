import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Search } from 'lucide-react';
import { format } from 'date-fns';

type AuditEntry = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
  user_name?: string;
};

export default function AdminAuditTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const [auditRes, profilesRes] = await Promise.all([
      (supabase as any).from('audit_log').select('*').order('created_at', { ascending: false }).limit(200),
      (supabase as any).from('profiles').select('id, full_name'),
    ]);

    const profiles = profilesRes.data || [];
    const enriched = (auditRes.data || []).map((e: AuditEntry) => ({
      ...e,
      user_name: profiles.find((p: any) => p.id === e.user_id)?.full_name || 'Unknown',
    }));
    setEntries(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const filtered = entries.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.action.toLowerCase().includes(q) ||
           e.entity_type.toLowerCase().includes(q) ||
           e.user_name?.toLowerCase().includes(q);
  });

  const actionColor = (action: string) => {
    if (action.startsWith('create') || action.startsWith('add')) return 'bg-green-100 text-green-800';
    if (action.startsWith('update') || action.startsWith('edit')) return 'bg-blue-100 text-blue-800';
    if (action.startsWith('delete') || action.startsWith('remove')) return 'bg-destructive/10 text-destructive';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5" /> Activity Log
        </CardTitle>
        <CardDescription>Track all admin actions and changes — {entries.length} entries</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by action, entity, or user..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading activity log...</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No activity recorded yet. Actions will appear here as admins make changes.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(e.created_at), 'MMM d, HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{e.user_name}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${actionColor(e.action)}`}>{e.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {e.entity_type}
                      {e.entity_id && <span className="text-muted-foreground text-xs ml-1">#{e.entity_id.slice(0, 6)}</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {e.details ? JSON.stringify(e.details) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
