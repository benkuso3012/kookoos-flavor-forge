import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, subDays, startOfDay, endOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { Download, FileSpreadsheet, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Order = {
  id: string; status: string; total_amount: number;
  delivery_address: string; phone: string; notes: string | null;
  created_at: string; user_id: string;
};

interface AdminReportsTabProps {
  orders: Order[];
}

function downloadCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) { toast.error('No data to export'); return; }
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = String(row[h] ?? '').replace(/"/g, '""');
      return `"${val}"`;
    }).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${filename}.csv`);
}

export default function AdminReportsTab({ orders }: AdminReportsTabProps) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const filtered = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const d = new Date(o.created_at);
      if (period === 'today') return d >= startOfDay(now);
      if (period === 'week') return d >= startOfWeek(now);
      if (period === 'month') return d >= startOfMonth(now);
      return true;
    });
  }, [orders, period]);

  const stats = useMemo(() => {
    const total = filtered.reduce((s, o) => s + Number(o.total_amount), 0);
    const delivered = filtered.filter(o => o.status === 'delivered');
    const cancelled = filtered.filter(o => o.status === 'cancelled');
    return {
      totalOrders: filtered.length,
      totalRevenue: total,
      avgOrder: filtered.length ? total / filtered.length : 0,
      deliveredCount: delivered.length,
      deliveredRevenue: delivered.reduce((s, o) => s + Number(o.total_amount), 0),
      cancelledCount: cancelled.length,
      cancelRate: filtered.length ? (cancelled.length / filtered.length) * 100 : 0,
    };
  }, [filtered]);

  const dailyBreakdown = useMemo(() => {
    const map: Record<string, { date: string; orders: number; revenue: number }> = {};
    filtered.forEach(o => {
      const day = format(new Date(o.created_at), 'yyyy-MM-dd');
      if (!map[day]) map[day] = { date: day, orders: 0, revenue: 0 };
      map[day].orders++;
      map[day].revenue += Number(o.total_amount);
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  }, [filtered]);

  const exportOrders = () => {
    downloadCSV(filtered.map(o => ({
      order_id: o.id.slice(0, 8),
      date: format(new Date(o.created_at), 'yyyy-MM-dd HH:mm'),
      status: o.status,
      total_tsh: Number(o.total_amount),
      phone: o.phone,
      address: o.delivery_address,
      notes: o.notes || '',
    })), `orders-${period}-${format(new Date(), 'yyyyMMdd')}`);
  };

  const exportDailySummary = () => {
    downloadCSV(dailyBreakdown.map(d => ({
      date: d.date,
      total_orders: d.orders,
      total_revenue_tsh: d.revenue,
      avg_order_tsh: d.orders ? Math.round(d.revenue / d.orders) : 0,
    })), `daily-summary-${format(new Date(), 'yyyyMMdd')}`);
  };

  const exportCustomers = async () => {
    const { data } = await (supabase as any).from('profiles').select('*');
    if (!data || data.length === 0) { toast.error('No customer data'); return; }
    downloadCSV(data.map((p: any) => ({
      name: p.full_name || 'N/A',
      phone: p.phone || '',
      address: p.address || '',
      loyalty_points: p.loyalty_points,
      joined: format(new Date(p.created_at), 'yyyy-MM-dd'),
    })), `customers-${format(new Date(), 'yyyyMMdd')}`);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportOrders} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export Orders
          </Button>
          <Button variant="outline" size="sm" onClick={exportDailySummary} className="gap-1.5 text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Daily Summary
          </Button>
          <Button variant="outline" size="sm" onClick={exportCustomers} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Customers
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: stats.totalOrders, color: 'text-primary' },
          { label: 'Total Revenue', value: `TSh ${stats.totalRevenue.toLocaleString()}`, color: 'text-green-600' },
          { label: 'Avg Order', value: `TSh ${Math.round(stats.avgOrder).toLocaleString()}`, color: 'text-blue-600' },
          { label: 'Cancel Rate', value: `${stats.cancelRate.toFixed(1)}%`, color: stats.cancelRate > 10 ? 'text-destructive' : 'text-muted-foreground' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Daily Breakdown
          </CardTitle>
          <CardDescription>{dailyBreakdown.length} days shown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyBreakdown.map(d => (
                  <TableRow key={d.date}>
                    <TableCell className="font-medium">{format(new Date(d.date), 'EEE, MMM d')}</TableCell>
                    <TableCell className="text-right">{d.orders}</TableCell>
                    <TableCell className="text-right font-medium">TSh {d.revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">TSh {d.orders ? Math.round(d.revenue / d.orders).toLocaleString() : 0}</TableCell>
                  </TableRow>
                ))}
                {dailyBreakdown.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No data for this period</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
