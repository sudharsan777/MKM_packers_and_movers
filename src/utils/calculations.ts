import { QuotationItem, Invoice, Payment, Expense, Lead, InvoiceStatus } from '../types';

/**
 * Format number into standard Indian Currency string (e.g., ₹1,25,000)
 */
export const formatIndianCurrency = (amount: number | string | undefined | null): string => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

/**
 * Format date to standard Indian English readable format (e.g. 24 Aug 2026)
 */
export const formatBusinessDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Calculate subtotal from an array of quotation/invoice line items
 */
export const calculateSubtotal = (items: QuotationItem[] = []): number => {
  return items.reduce((acc, item) => {
    const qty = Number(item.qty) || 1;
    const rate = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const amount = Number(item.amount) || Math.max(0, qty * rate - discount);
    return acc + amount;
  }, 0);
};

/**
 * Calculate taxable amount after discount
 */
export const calculateDiscount = (subtotal: number, discountAmount: number = 0): number => {
  return Math.min(Math.max(0, subtotal), Math.max(0, discountAmount));
};

/**
 * Calculate GST tax amount
 */
export const calculateTax = (taxableAmount: number, taxRate: number = 18): number => {
  if (!taxRate || taxRate <= 0) return 0;
  return Math.round((taxableAmount * taxRate) / 100);
};

/**
 * Calculate Grand Total
 */
export const calculateGrandTotal = (
  subtotal: number,
  discount: number = 0,
  taxRate: number = 0
): number => {
  const discounted = Math.max(0, subtotal - (discount || 0));
  const tax = calculateTax(discounted, taxRate);
  return discounted + tax;
};

/**
 * Calculate amount paid for a specific invoice from the ledger of payments
 */
export const calculateAmountPaid = (payments: Payment[] = [], invoiceId: string): number => {
  return payments
    .filter((p) => p.invoiceId === invoiceId)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
};

/**
 * Calculate balance due
 */
export const calculateBalanceDue = (grandTotal: number, amountPaid: number): number => {
  return Math.max(0, (grandTotal || 0) - (amountPaid || 0));
};

/**
 * Determine exact invoice status including Overdue evaluation
 */
export const determineInvoiceStatus = (
  grandTotal: number,
  amountPaid: number,
  dueDateString?: string
): InvoiceStatus => {
  const balance = calculateBalanceDue(grandTotal, amountPaid);
  if (balance <= 0 && grandTotal > 0) return 'Paid';

  if (dueDateString) {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!isNaN(dueDate.getTime()) && dueDate < today && balance > 0) {
      return 'Overdue';
    }
  }

  if (amountPaid > 0 && balance > 0) return 'Partially Paid';
  return 'Unpaid';
};

/**
 * Calculate Net Profit (Total Collections - Total Operating Expenses)
 */
export const calculateNetProfit = (revenue: number, expenses: Expense[] = []): number => {
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  return (revenue || 0) - totalExpenses;
};

/**
 * Calculate Lead to Booking conversion rate
 */
export const calculateLeadConversionRate = (leads: Lead[] = []): number => {
  if (leads.length === 0) return 0;
  const converted = leads.filter((l) => l.status === 'Confirmed' || l.status === 'Completed').length;
  return Math.round((converted / leads.length) * 100);
};

/**
 * Convert number to Indian English words (e.g. Rupees Twenty One Thousand Only)
 */
export const numberToWordsIndian = (num: number): string => {
  if (!num || num === 0) return 'Rupees Zero Only';
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000)
      return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '')
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '')
      );
    return (
      convert(Math.floor(n / 10000000)) +
      ' Crore' +
      (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '')
    );
  }

  const rounded = Math.round(num);
  return 'Rupees ' + convert(rounded).trim() + ' Only';
};
