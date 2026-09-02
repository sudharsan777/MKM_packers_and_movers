import {
  Customer,
  Lead,
  Quotation,
  Booking,
  Invoice,
  Payment,
  Expense,
  SearchResultItem,
} from '../types';
import { formatIndianCurrency, formatBusinessDate } from '../utils/calculations';

export class SearchService {
  public static searchAll(
    query: string,
    data: {
      customers: Customer[];
      leads: Lead[];
      quotations: Quotation[];
      bookings: Booking[];
      invoices: Invoice[];
      payments: Payment[];
      expenses: Expense[];
    }
  ): SearchResultItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];
    const getCustomerName = (customerId: string) => {
      const c = data.customers.find((cust) => cust.id === customerId);
      return c?.name || 'Customer';
    };

    // 1. Invoices
    data.invoices.forEach((inv) => {
      const cName = inv.customerName || getCustomerName(inv.customerId);
      const cPhone = inv.customerPhone || '';
      const text = `${inv.invoiceNumber} ${cName} ${cPhone} ${inv.moveFromAddress || ''} ${inv.moveToAddress || ''} ${inv.status}`.toLowerCase();
      if (text.includes(q)) {
        results.push({
          id: inv.id,
          type: 'invoice',
          title: `Invoice #${inv.invoiceNumber}`,
          subtitle: `${cName} • ${formatIndianCurrency(inv.grandTotal)}`,
          badge: inv.status,
          badgeVariant: inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning',
          meta: `Date: ${formatBusinessDate(inv.date)} • Bal: ${formatIndianCurrency(inv.balanceDue)}`,
          url: `/invoices`,
          date: inv.date,
        });
      }
    });

    // 2. Bookings (Orders)
    data.bookings.forEach((bkg) => {
      const cName = getCustomerName(bkg.customerId);
      const text = `${bkg.bookingNumber} ${cName} ${bkg.pickupLocation} ${bkg.dropLocation} ${bkg.vehicle} ${bkg.driver} ${bkg.status}`.toLowerCase();
      if (text.includes(q)) {
        results.push({
          id: bkg.id,
          type: 'booking',
          title: `Order #${bkg.bookingNumber}`,
          subtitle: `${cName} • ${bkg.pickupLocation.split(',')[0]} ➔ ${bkg.dropLocation.split(',')[0]}`,
          badge: bkg.status,
          badgeVariant: bkg.status === 'Completed' ? 'success' : 'info',
          meta: `Move Date: ${formatBusinessDate(bkg.movingDate)} • ${formatIndianCurrency(bkg.totalAmount)}`,
          url: `/bookings`,
          date: bkg.movingDate,
        });
      }
    });

    // 3. Quotations
    data.quotations.forEach((quote) => {
      const cName = getCustomerName(quote.customerId);
      const text = `${quote.quotationNumber} ${cName} ${quote.pickupAddress} ${quote.dropAddress} ${quote.status}`.toLowerCase();
      if (text.includes(q)) {
        results.push({
          id: quote.id,
          type: 'quotation',
          title: `Quote #${quote.quotationNumber}`,
          subtitle: `${cName} • ${quote.propertyType}`,
          badge: quote.status,
          badgeVariant: quote.status === 'Accepted' ? 'success' : 'info',
          meta: `Est: ${formatIndianCurrency(quote.grandTotal)} • Valid till: ${formatBusinessDate(quote.validUntil)}`,
          url: `/quotations`,
          date: quote.date,
        });
      }
    });

    // 4. Leads / Enquiries
    data.leads.forEach((lead) => {
      const cName = getCustomerName(lead.customerId);
      const text = `${cName} ${lead.pickupLocation} ${lead.dropLocation} ${lead.propertyType} ${lead.source} ${lead.status} ${lead.notes}`.toLowerCase();
      if (text.includes(q)) {
        results.push({
          id: lead.id,
          type: 'lead',
          title: `Enquiry: ${cName}`,
          subtitle: `${lead.pickupLocation.split(',')[0]} ➔ ${lead.dropLocation.split(',')[0]}`,
          badge: lead.status,
          badgeVariant: lead.status === 'Confirmed' ? 'success' : 'warning',
          meta: `Move: ${formatBusinessDate(lead.movingDate)} • Est: ${formatIndianCurrency(lead.estimatedValue)}`,
          url: `/leads`,
          date: lead.movingDate,
        });
      }
    });

    // 5. Customers
    data.customers.forEach((cust) => {
      const text = `${cust.name} ${cust.phone} ${cust.whatsapp} ${cust.email} ${cust.address || ''}`.toLowerCase();
      if (text.includes(q)) {
        results.push({
          id: cust.id,
          type: 'customer',
          title: cust.name,
          subtitle: `Phone: ${cust.phone}`,
          badge: 'Customer',
          badgeVariant: 'neutral',
          meta: `Added: ${formatBusinessDate(cust.createdAt)}`,
          url: `/customers`,
          date: cust.createdAt,
        });
      }
    });

    // 6. Expenses
    data.expenses.forEach((exp) => {
      const text = `${exp.name} ${exp.category} ${exp.notes} ${exp.method}`.toLowerCase();
      if (text.includes(q)) {
        results.push({
          id: exp.id,
          type: 'expense',
          title: exp.name,
          subtitle: `${exp.category} • ${formatIndianCurrency(exp.amount)}`,
          badge: exp.category,
          badgeVariant: 'warning',
          meta: `Date: ${formatBusinessDate(exp.date)}`,
          url: `/expenses`,
          date: exp.date,
        });
      }
    });

    return results.slice(0, 15);
  }
}
