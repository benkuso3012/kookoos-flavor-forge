import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Users, Crown, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  loyalty_points: number;
  created_at: string;
};

type CustomerWithOrders = Profile & {
  orderCount: number;
  totalSpent: number;
};

export default function AdminCustomersTab() {
  const [customers, setCustomers] = useState<CustomerWithOrders[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const [profilesRes, ordersRes] = await Promise.all([
      (supabase as any).from('profiles').select('*').order('created_at', { ascending: false }),
      (supabase as any).from('orders').select('user_id, total_amount'),
    ]);

    const profiles: Profile[] = profilesRes.data || [];
    const orders = ordersRes.data || [];

    const orderMap: Record<string, { count: number; total: number }> = {};
    orders.forEach((o: any) => {
      if (!orderMap[o.user_id]) orderMap[o.user_id] = { count: 0, total: 0 };
      orderMap[o.user_id].count++;
      orderMap[o.user_id].total += Number(o.total_amount);
    });

    const enriched = profiles.map(p => ({
      ...p,
      orderCount: orderMap[p.id]?.count || 0,
      totalSpent: orderMap[p.id]?.total || 0,
    }));

    setCustomers(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.full_name?.toLowerCase().includes(q)) ||
           (c.phone?.includes(q)) ||
           (c.address?.toLowerCase().includes(q));
  });

  const topSpenders = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{customers.length}</p>
                <p className="text-xs text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{customers.filter(c => c.loyalty_points > 100).length}</p>
                <p className="text-xs text-muted-foreground">Loyal Customers (100+ pts)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  TSh {customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Customer Spend</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Spenders */}
      {topSpenders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" /> Top Spenders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto">
              {topSpenders.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3 min-w-[200px]">
                  <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                  <div>
                    <p className="font-medium text-sm text-foreground">{c.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">TSh {c.totalSpent.toLocaleString()} • {c.orderCount} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">All Customers</CardTitle>
          <CardDescription>{filtered.length} customers found</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading customers...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Loyalty Points</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.full_name || <span className="text-muted-foreground italic">Anonymous</span>}</TableCell>
                      <TableCell className="text-sm">{c.phone || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={c.loyalty_points > 100 ? 'default' : 'secondary'}>
                          {c.loyalty_points} pts
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{c.orderCount}</TableCell>
                      <TableCell className="font-medium">TSh {c.totalSpent.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(c.created_at), 'MMM d, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No customers found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
