import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Line, ComposedChart } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

type Order = {
  id: string;
  total_amount: number;
  created_at: string;
  status: string;
};

const chartConfig = {
  revenue: { label: 'Revenue (TSh)', color: 'hsl(var(--primary))' },
  orders: { label: 'Orders', color: 'hsl(var(--accent))' },
};

export default function RevenueChart({ orders }: { orders: Order[] }) {
  const data = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      return { date, label: format(date, 'EEE'), revenue: 0, orders: 0 };
    });

    orders.forEach(order => {
      if (order.status === 'cancelled') return;
      const orderDate = startOfDay(new Date(order.created_at));
      const day = days.find(d => d.date.getTime() === orderDate.getTime());
      if (day) {
        day.revenue += Number(order.total_amount);
        day.orders += 1;
      }
    });

    return days.map(d => ({ name: d.label, revenue: d.revenue, orders: d.orders }));
  }, [orders]);

  const totalWeek = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-base">7-Day Revenue</CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: <strong className="text-foreground">TSh {totalWeek.toLocaleString()}</strong></span>
          <span>Orders: <strong className="text-foreground">{totalOrders}</strong></span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
