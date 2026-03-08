import { useCallback } from 'react';
import { format } from 'date-fns';

type OrderItem = {
  id: string;
  item_name: string;
  item_price: number;
  quantity: number;
};

type Order = {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  phone: string;
  notes: string | null;
  created_at: string;
  user_id: string;
};

interface ReceiptPrinterProps {
  order: Order;
  items: OrderItem[];
  storeName?: string;
}

export default function ReceiptPrinter({ order, items, storeName = 'Kookoos Restaurant' }: ReceiptPrinterProps) {
  const printReceipt = useCallback(() => {
    const receiptWindow = window.open('', '_blank', 'width=320,height=600');
    if (!receiptWindow) return;

    const itemRows = items.map(item => `
      <tr>
        <td style="text-align:left;padding:2px 0;">${item.item_name}</td>
        <td style="text-align:center;padding:2px 4px;">${item.quantity}</td>
        <td style="text-align:right;padding:2px 0;">TSh ${(Number(item.item_price) * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt #${order.id.slice(0, 8)}</title>
  <style>
    @media print {
      @page { margin: 0; size: 80mm auto; }
      body { margin: 0; }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      width: 280px;
      margin: 0 auto;
      padding: 10px;
      color: #000;
      background: #fff;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider {
      border-top: 1px dashed #333;
      margin: 8px 0;
    }
    .header { font-size: 18px; font-weight: bold; margin-bottom: 2px; }
    .subheader { font-size: 10px; color: #555; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; padding: 2px 0; border-bottom: 1px solid #333; }
    th:nth-child(2) { text-align: center; }
    th:last-child { text-align: right; }
    .total-row { font-size: 14px; font-weight: bold; }
    .footer { font-size: 10px; color: #555; margin-top: 12px; }
    .no-print { text-align: center; margin-top: 16px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="center">
    <div class="header">🍗 ${storeName}</div>
    <div class="subheader">Bahari Beach • Tegeta • Sinza</div>
    <div class="subheader">Taste the Flavor of Tanzania</div>
  </div>

  <div class="divider"></div>

  <div style="font-size:11px;">
    <div><strong>Order:</strong> #${order.id.slice(0, 8).toUpperCase()}</div>
    <div><strong>Date:</strong> ${format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</div>
    <div><strong>Status:</strong> ${order.status.toUpperCase()}</div>
    <div><strong>Phone:</strong> ${order.phone}</div>
    <div><strong>Address:</strong> ${order.delivery_address}</div>
    ${order.notes ? `<div><strong>Notes:</strong> ${order.notes}</div>` : ''}
  </div>

  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="divider"></div>

  <table>
    <tr class="total-row">
      <td style="text-align:left;">TOTAL</td>
      <td style="text-align:right;">TSh ${Number(order.total_amount).toLocaleString()}</td>
    </tr>
  </table>

  <div class="divider"></div>

  <div class="center footer">
    <p>Payment: M-Pesa / TigoPesa / Cash</p>
    <p style="margin-top:6px;">Asante sana! 🙏</p>
    <p>Thank you for choosing ${storeName}!</p>
    <p style="margin-top:4px;">--- END OF RECEIPT ---</p>
  </div>

  <div class="no-print">
    <button onclick="window.print()" style="padding:8px 24px;font-size:14px;cursor:pointer;background:#FF6B00;color:white;border:none;border-radius:6px;">
      🖨️ Print Receipt
    </button>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    receiptWindow.document.write(html);
    receiptWindow.document.close();
  }, [order, items, storeName]);

  return { printReceipt };
}

// Hook version for cleaner usage
export function usePrintReceipt() {
  const printReceipt = (order: Order, items: OrderItem[], storeName = 'Kookoos Restaurant') => {
    const component = ReceiptPrinter({ order, items, storeName });
    component.printReceipt();
  };
  return { printReceipt };
}
