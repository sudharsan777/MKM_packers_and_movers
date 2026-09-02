import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useToast } from '../components/ui/Toast';
import { useAppContext } from '../store/AppContext';
import { formatDate, formatCurrency } from '../utils';
import {
  Search,
  Plus,
  CreditCard,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Payment, PaymentMethod } from '../types';

export const Payments = () => {
  const { payments, invoices, customers, addPayment, updatePayment, deletePayment } = useAppContext();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('Payment received with thanks');

  const getCustomer = (id: string) => customers.find((c) => c.id === id);
  const getInvoice = (id: string) => invoices.find((i) => i.id === id);

  const filteredPayments = payments.filter((p) => {
    const customer = customers.find((c) => c.id === p.customerId);
    const invoice = invoices.find((i) => i.id === p.invoiceId);
    const matchesSearch =
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollectedAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const getMethodBadge = (method: PaymentMethod | string) => {
    switch (method) {
      case 'UPI':
        return { variant: 'success' as const, label: 'UPI / PhonePe' };
      case 'Cash':
        return { variant: 'warning' as const, label: 'Cash' };
      case 'Bank Transfer':
        return { variant: 'info' as const, label: 'NEFT / Bank' };
      case 'Card':
        return { variant: 'neutral' as const, label: 'Card' };
      default:
        return { variant: 'neutral' as const, label: method };
    }
  };

  const handleOpenAddModal = () => {
    setEditingPaymentId(null);
    if (invoices.length > 0) {
      const firstUnpaid = invoices.find((i) => i.balanceDue > 0) || invoices[0];
      setSelectedInvoiceId(firstUnpaid.id);
      setPaymentAmount(firstUnpaid.balanceDue > 0 ? firstUnpaid.balanceDue.toString() : '5000');
    }
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('UPI');
    setPaymentRef(`TXN-${Date.now().toString().slice(-6)}`);
    setPaymentNotes('Payment received with thanks');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: Payment) => {
    setEditingPaymentId(p.id);
    setSelectedInvoiceId(p.invoiceId);
    setPaymentAmount(p.amount.toString());
    setPaymentDate(p.date);
    setPaymentMethod(p.method);
    setPaymentRef(p.referenceNumber || '');
    setPaymentNotes(p.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const inv = getInvoice(selectedInvoiceId);
    if (!inv) {
      toastError('Invoice Missing', 'Please select a valid invoice.');
      return;
    }

    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toastError('Invalid Amount', 'Payment amount must be greater than zero.');
      return;
    }

    if (editingPaymentId) {
      const existingPayment = payments.find((p) => p.id === editingPaymentId);
      const updatedPayment: Payment = {
        id: editingPaymentId,
        invoiceId: selectedInvoiceId,
        customerId: inv.customerId,
        amount: amt,
        date: paymentDate,
        method: paymentMethod,
        referenceNumber: paymentRef.trim() || `TXN-${Date.now().toString().slice(-4)}`,
        notes: paymentNotes,
        createdAt: existingPayment?.createdAt || new Date().toISOString(),
      };

      try {
        const res = await updatePayment(updatedPayment);
        if (res.success) {
          success('Payment Updated', `Updated payment of ${formatCurrency(amt)} against ${inv.invoiceNumber}.`);
          setIsAddModalOpen(false);
        } else {
          toastError('Payment Update Failed', res.error || 'Unable to save. Please check your connection and try again.');
        }
      } catch (err: any) {
        toastError('Payment Error', err?.message || 'Unable to save. Please check your connection and try again.');
      }
    } else {
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        invoiceId: selectedInvoiceId,
        customerId: inv.customerId,
        amount: amt,
        date: paymentDate,
        method: paymentMethod,
        referenceNumber: paymentRef.trim() || `TXN-${Date.now().toString().slice(-4)}`,
        notes: paymentNotes,
        createdAt: new Date().toISOString(),
      };

      try {
        const res = await addPayment(newPayment);
        if (res.success) {
          success('Payment Recorded', `Received ${formatCurrency(amt)} against ${inv.invoiceNumber}.`);
          setIsAddModalOpen(false);
        } else {
          toastError('Payment Failed', res.error || 'Unable to save. Please check your connection and try again.');
        }
      } catch (err: any) {
        toastError('Payment Error', err?.message || 'Unable to save. Please check your connection and try again.');
      }
    }
  };

  const handleDeletePayment = async (p: Payment) => {
    if (window.confirm(`Are you sure you want to delete this payment of ${formatCurrency(p.amount)}?`)) {
      try {
        const res = await deletePayment(p.id);
        if (res.success) {
          success('Payment Deleted', `Payment record removed and invoice balance recalculated.`);
        } else {
          toastError('Delete Failed', res.error || 'Unable to delete payment.');
        }
      } catch (err: any) {
        toastError('Delete Error', err?.message || 'Unable to delete payment.');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Search & Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="payments-search-input"
              type="text"
              placeholder="Search payments by customer, invoice #, UTR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <select
            id="payments-method-filter"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-9.5 px-3 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI / PhonePe / GPay</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer / NEFT</option>
            <option value="Card">Debit / Credit Card</option>
            <option value="Other">Cheque / Other</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Collections</span>
            <span className="text-sm font-black text-emerald-700">{formatCurrency(totalCollectedAmount)}</span>
          </div>

          <Button
            id="btn-add-payment-modal"
            variant="primary"
            size="md"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="w-4 h-4 text-white" />}
            className="shrink-0 font-bold"
          >
            Record Payment
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        {filteredPayments.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-6 h-6 text-slate-400" />}
            title="No payment records found"
            description="Track customer cash, UPI, and bank collections with transaction reference numbers."
            actionLabel="Record Payment"
            onAction={handleOpenAddModal}
            actionIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice Ref</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference / UTR</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((p) => {
                const customer = getCustomer(p.customerId);
                const inv = getInvoice(p.invoiceId);
                const methodInfo = getMethodBadge(p.method);
                return (
                  <TableRow key={p.id}>
                    {/* Date */}
                    <TableCell>
                      <span className="font-semibold text-slate-900 whitespace-nowrap">
                        {formatDate(p.date)}
                      </span>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900 truncate">{customer?.name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-500">{customer?.phone}</p>
                      </div>
                    </TableCell>

                    {/* Invoice Ref */}
                    <TableCell>
                      <span className="font-mono font-bold text-slate-700">
                        {inv?.invoiceNumber || 'INV-REF'}
                      </span>
                    </TableCell>

                    {/* Method */}
                    <TableCell>
                      <Badge variant={methodInfo.variant} dot>
                        {methodInfo.label}
                      </Badge>
                    </TableCell>

                    {/* Reference # */}
                    <TableCell>
                      <span className="font-mono text-slate-600 text-xs">
                        {p.referenceNumber || 'N/A'}
                      </span>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>
                      <span className="font-black text-emerald-700 whitespace-nowrap">
                        {formatCurrency(p.amount)}
                      </span>
                    </TableCell>

                    {/* Notes */}
                    <TableCell>
                      <span className="text-slate-500 text-[11px] truncate max-w-xs block">
                        {p.notes || 'Settlement'}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Payment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Payment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Record / Edit Payment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingPaymentId ? 'Edit Payment Record' : 'Record Customer Payment'}
        subtitle={editingPaymentId ? 'Update payment amount or transaction reference' : 'Log received payment against an invoice and update balance'}
        maxWidth="md"
      >
        <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
          <Select
            label="Select Invoice / Customer *"
            value={selectedInvoiceId}
            disabled={!!editingPaymentId}
            onChange={(e) => {
              setSelectedInvoiceId(e.target.value);
              const inv = getInvoice(e.target.value);
              if (inv && inv.balanceDue > 0) {
                setPaymentAmount(inv.balanceDue.toString());
              }
            }}
            options={invoices.map((i) => {
              const cust = getCustomer(i.customerId);
              return {
                label: `${i.invoiceNumber} — ${cust?.name} (Due: ₹${i.balanceDue.toLocaleString('en-IN')})`,
                value: i.id,
              };
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Amount Received (₹) *"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />
            <Input
              label="Payment Date *"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Payment Mode *"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              options={[
                { label: 'UPI / PhonePe / GPay', value: 'UPI' },
                { label: 'Cash Settlement', value: 'Cash' },
                { label: 'Bank Transfer / NEFT / IMPS', value: 'Bank Transfer' },
                { label: 'Debit / Credit Card', value: 'Card' },
                { label: 'Cheque / Draft', value: 'Other' },
              ]}
            />
            <Input
              label="Transaction / UTR Number"
              placeholder="e.g. UPI-982173"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
            />
          </div>

          <Input
            label="Payment Notes / Remarks"
            placeholder="e.g. Advance move settlement"
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" type="submit">
              {editingPaymentId ? 'Update Payment' : 'Confirm & Save Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
