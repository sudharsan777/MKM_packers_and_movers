import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, Input, Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useToast } from '../components/ui/Toast';
import { useAppContext } from '../store/AppContext';
import { formatDate, formatCurrency } from '../utils';
import {
  Search,
  Plus,
  Filter,
  FileText,
  Download,
  Share2,
  CreditCard,
  Printer,
  Trash2,
  PlusCircle,
  CheckCircle2,
  DollarSign,
  Receipt,
  Eye,
  MessageCircle,
  AlertCircle,
  LayoutGrid,
  List,
  Phone,
  PhoneCall,
  RotateCcw,
  Sparkles,
  Check,
  Calendar,
  Building,
  TrendingUp,
  Edit3,
  Truck,
  MapPin,
  Package,
} from 'lucide-react';
import { Invoice, QuotationItem, PaymentMethod } from '../types';
import { generateInvoicePDF, numberToWordsIndian } from '../utils/pdfExport';

export const Invoices = () => {
  const { invoices, customers, settings, addInvoice, updateInvoice, deleteInvoice, addPayment, generateNextInvoiceNumber } =
    useAppContext();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Simplified & Intuitive Invoice Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [vehicleNo, setVehicleNo] = useState('TN 88 L 5186');

  // Customer & Route Details (Directly Editable)
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [customerName, setCustomerName] = useState('Ganesh');
  const [customerPhone, setCustomerPhone] = useState('9585702029');
  const [moveFromAddress, setMoveFromAddress] = useState('West Mambalam, Chennai');
  const [moveToAddress, setMoveToAddress] = useState('Senthamizh Nagar, Sivagangai');

  // Package Specs
  const [packageCount, setPackageCount] = useState('46 Cartons / Household Items');

  // Line Items (Handling, Labour, Packing, Transport)
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: '1',
      service: 'Transportation & Dedicated Freight Charges',
      description: 'West Mambalam to Sivagangai shifting',
      qty: 1,
      unitPrice: 15000,
      discount: 0,
      amount: 15000,
    },
    {
      id: '2',
      service: 'Handling, Loading & Labour Charges',
      description: '4-Member professional shifting crew at origin and destination',
      qty: 1,
      unitPrice: 3500,
      discount: 0,
      amount: 3500,
    },
    {
      id: '3',
      service: 'Packing Materials & Professional Packing',
      description: 'Carton boxes, bubble wrap, corrugated sheets protection',
      qty: 1,
      unitPrice: 2500,
      discount: 0,
      amount: 2500,
    },
  ]);

  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [amountPaidInit, setAmountPaidInit] = useState<string>('0');
  const [notes, setNotes] = useState('Payment is requested upon unloading & final delivery.');

  // Payment Recording State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('Received via PhonePe / GPay');

  const getCustomer = (id: string) => customers.find((c) => c.id === id);
  const getCustomerName = (inv: Invoice) => inv.customerName || getCustomer(inv.customerId)?.name || 'Customer';
  const getCustomerPhone = (inv: Invoice) => inv.customerPhone || getCustomer(inv.customerId)?.phone || '';

  const calculateSubtotal = (itemList: QuotationItem[]) => {
    return itemList.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
      const q = field === 'qty' ? Math.max(1, Number(value) || 1) : item.qty;
      const p = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
      const d = field === 'discount' ? Number(value) || 0 : item.discount;
      item.qty = q;
      item.unitPrice = p;
      item.discount = d;
      item.amount = Math.max(0, q * p - d);
    }
    updated[index] = item;
    setItems(updated);
  };

  // Quick Preset Add
  const handleAddPresetItem = (serviceName: string, defaultPrice: number, defaultDesc: string) => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        service: serviceName,
        description: defaultDesc,
        qty: 1,
        unitPrice: defaultPrice,
        discount: 0,
        amount: defaultPrice,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toastError('Cannot Remove', 'Invoice must contain at least one charge item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = calculateSubtotal(items);
  const discountVal = Number(discountAmount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountVal);
  const grandTotal = taxableAmount;
  const initPaid = Number(amountPaidInit) || 0;
  const balanceDue = Math.max(0, grandTotal - initPaid);

  // Quick Auto-Fill Customer
  const handleQuickCustomerPick = (cId: string) => {
    setCustomerId(cId);
    const found = customers.find((c) => c.id === cId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = async () => {
    setEditingInvoiceId(null);
    try {
      const invNum = await generateNextInvoiceNumber();
      setInvoiceNumber(invNum);
    } catch {
      setInvoiceNumber(`${settings.invoicePrefix || 'INV-'}${Date.now().toString().slice(-4)}`);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setVehicleNo('TN 88 L 5186');

    if (customers.length > 0) {
      setCustomerId(customers[0].id);
      setCustomerName(customers[0].name);
      setCustomerPhone(customers[0].phone);
    } else {
      setCustomerName('Ganesh');
      setCustomerPhone('9585702029');
    }

    setMoveFromAddress('No 4 Sreenath Flats, West Mambalam, Chennai');
    setMoveToAddress('Senthamizh Nagar, Sivagangai');
    setPackageCount('46 Cartons / Household Items');

    setItems([
      {
        id: '1',
        service: 'Transportation & Dedicated Freight Charges',
        description: 'West Mambalam to Sivagangai shifting',
        qty: 1,
        unitPrice: 15000,
        discount: 0,
        amount: 15000,
      },
      {
        id: '2',
        service: 'Handling, Loading & Labour Charges',
        description: '4-Member professional shifting crew at origin & destination',
        qty: 1,
        unitPrice: 3500,
        discount: 0,
        amount: 3500,
      },
      {
        id: '3',
        service: 'Packing Materials & Professional Packing',
        description: 'Carton boxes, bubble wrap, corrugated sheets protection',
        qty: 1,
        unitPrice: 2500,
        discount: 0,
        amount: 2500,
      },
    ]);
    setDiscountAmount('0');
    setAmountPaidInit('0');
    setNotes('Payment is requested upon unloading & final delivery.');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber);
    setDate(invoice.date);
    setDueDate(invoice.dueDate);
    setVehicleNo(invoice.vehicleNo || 'TN 88 L 5186');

    setCustomerId(invoice.customerId);
    setCustomerName(invoice.customerName || getCustomerName(invoice));
    setCustomerPhone(invoice.customerPhone || getCustomer(invoice.customerId)?.phone || '');
    setMoveFromAddress(invoice.moveFromAddress || 'West Mambalam, Chennai');
    setMoveToAddress(invoice.moveToAddress || 'Senthamizh Nagar, Sivagangai');
    setPackageCount(invoice.packageCount || '46 Cartons / Household Items');

    setItems(invoice.items);
    setDiscountAmount(invoice.discount.toString());
    setAmountPaidInit(invoice.amountPaid.toString());
    setNotes(invoice.notes || 'Payment is requested upon unloading & final delivery.');
    setIsAddModalOpen(true);
  };

  // Save / Update Invoice
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      toastError('Missing Details', 'Customer name and phone number are required.');
      return;
    }

    if (items.length === 0) {
      toastError('Missing Items', 'Invoice must have at least one billable item.');
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountVal = Number(discountAmount) || 0;
    const initPaid = Number(amountPaidInit) || 0;
    const grandTotal = Math.max(0, subtotal - discountVal);
    const balanceDue = Math.max(0, grandTotal - initPaid);
    const status = balanceDue === 0 ? 'Paid' : initPaid > 0 ? 'Partially Paid' : 'Unpaid';

    const invoiceData: Invoice = {
      id: editingInvoiceId || `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim() || `INV-${Date.now().toString().slice(-4)}`,
      customerId,
      date,
      dueDate,
      items,
      subtotal,
      discount: discountVal,
      tax: 0,
      grandTotal,
      amountPaid: initPaid,
      balanceDue,
      status,
      notes,
      createdAt: editingInvoiceId
        ? invoices.find((i) => i.id === editingInvoiceId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),

      documentTitle: 'TAX INVOICE',
      customerName,
      customerPhone,
      moveFromAddress,
      moveFromCityStatePin: 'Chennai, Tamil Nadu',
      moveToName: customerName,
      moveToPhone: customerPhone,
      moveToAddress,
      moveToCityStatePin: 'Tamil Nadu',
      vehicleNo,
      packageCount,
      weightVolume: '14ft Container',
      packageCondition: 'ALL ITEMS IN GOOD CONDITION',
    };

    try {
      if (editingInvoiceId) {
        await updateInvoice(invoiceData);
        success('Invoice Updated', `Invoice ${invoiceData.invoiceNumber} updated.`);
      } else {
        await addInvoice(invoiceData);
        if (initPaid > 0) {
          const payRes = await addPayment({
            id: `pay-${Date.now()}`,
            invoiceId: invoiceData.id,
            customerId: invoiceData.customerId,
            amount: initPaid,
            date: new Date().toISOString().split('T')[0],
            method: 'UPI',
            referenceNumber: `INIT-${Date.now().toString().slice(-4)}`,
            notes: 'Freight advance recorded',
            createdAt: new Date().toISOString(),
          });
          if (payRes && !payRes.success) {
            toastError('Payment Notice', payRes.error || 'Failed to record initial payment.');
          }
        }
        success('Invoice Issued', `Invoice ${invoiceData.invoiceNumber} created.`);
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      toastError('Unable to Save Invoice', err?.message || 'Unable to save. Please check your connection and try again.');
    }
  };

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balanceDue.toString());
    setPaymentRef(`UPI-${Date.now().toString().slice(-6)}`);
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amt = Number(paymentAmount) || 0;
    if (amt <= 0) {
      toastError('Invalid Amount', 'Payment amount must be greater than zero.');
      return;
    }

    try {
      const res = await addPayment({
        id: `pay-${Date.now()}`,
        invoiceId: selectedInvoice.id,
        customerId: selectedInvoice.customerId,
        amount: amt,
        date: new Date().toISOString().split('T')[0],
        method: paymentMethod,
        referenceNumber: paymentRef.trim() || `TXN-${Date.now().toString().slice(-4)}`,
        notes: paymentNotes,
        createdAt: new Date().toISOString(),
      });

      if (res.success) {
        success('Payment Recorded', `Received ${formatCurrency(amt)} for ${selectedInvoice.invoiceNumber}.`);
        setIsPaymentModalOpen(false);
      } else {
        toastError('Payment Failed', res.error || 'Unable to record payment.');
      }
    } catch (err: any) {
      toastError('Payment Error', err?.message || 'Unable to record payment.');
    }
  };

  // Direct 1-Click Download PDF
  const handleDownloadPDF = (invoice: Invoice) => {
    const customer = getCustomer(invoice.customerId);
    generateInvoicePDF(invoice, customer, settings);
    const custName = (invoice.customerName || customer?.name || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
    success('PDF Downloaded', `${custName}-${invoice.invoiceNumber}.pdf downloaded.`);
  };

  // Direct WhatsApp Share
  const handleShareWhatsApp = (invoice: Invoice) => {
    const custPhone = (invoice.customerPhone || getCustomer(invoice.customerId)?.phone || '').replace(
      /[^0-9]/g,
      ''
    );
    const cName = getCustomerName(invoice);
    const text = `*TAX INVOICE — ${settings.companyName.toUpperCase()}*\n\nDear ${cName},\nThank you for choosing *${settings.companyName}*. Here are your invoice details:\n\n📄 *Invoice No:* ${invoice.invoiceNumber}\n🚛 *Vehicle No:* ${invoice.vehicleNo || 'TN 88 L 5186'}\n📍 *Move:* ${invoice.moveFromAddress || 'West Mambalam, Chennai'} ➔ ${invoice.moveToAddress || 'Sivagangai'}\n📅 *Date:* ${formatDate(invoice.date)}\n\n💰 *Total Amount:* ${formatCurrency(invoice.grandTotal)}\n✅ *Freight Paid:* ${formatCurrency(invoice.amountPaid)}\n*⚠️ Balance Due: ${formatCurrency(invoice.balanceDue)}*\n\n📍 *Office:* ${settings.address}\n📞 *Support:* ${settings.phone}\n\nThank you for trusting MKM Packers & Movers!`;
    const finalPhone = custPhone.length === 10 ? '91' + custPhone : custPhone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Safe Invoice Deletion
  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      try {
        await deleteInvoice(invoice.id);
        success('Invoice Deleted', `Invoice ${invoice.invoiceNumber} has been removed.`);
      } catch (err: any) {
        toastError('Cannot Delete Invoice', err?.message || 'Invoice could not be deleted.');
      }
    }
  };

  // Filter Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const cName = getCustomerName(inv);
    const cPhone = getCustomerPhone(inv);
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cPhone.includes(searchTerm) ||
      (inv.vehicleNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.moveFromAddress || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.moveToAddress || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoicedSum = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalPaidSum = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalDueSum = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <div className="space-y-4">
      {/* ULTRA SLIM MINI STATS BAR (Made very small as requested) */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Invoiced:</span>
          <span className="font-extrabold text-slate-900">{formatCurrency(totalInvoicedSum)}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Collected:</span>
          <span className="font-extrabold text-emerald-700">{formatCurrency(totalPaidSum)}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Pending Due:</span>
          <span className="font-extrabold text-amber-900">{formatCurrency(totalDueSum)}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
          <span>Total Invoices:</span>
          <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full">
            {invoices.length}
          </span>
        </div>
      </div>

      {/* Header Search & Actions Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="invoices-search-input"
              type="text"
              placeholder="Search by invoice #, customer, vehicle, route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <Button
              id="btn-add-invoice-modal"
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
              className="font-bold shrink-0"
            >
              Issue Invoice
            </Button>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
          {[
            { id: 'ALL', label: `All (${invoices.length})` },
            { id: 'Unpaid', label: `Unpaid (${invoices.filter((i) => i.status === 'Unpaid').length})` },
            {
              id: 'Partially Paid',
              label: `Partial (${invoices.filter((i) => i.status === 'Partially Paid').length})`,
            },
            { id: 'Paid', label: `Paid (${invoices.filter((i) => i.status === 'Paid').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-2.5 py-0.5 text-xs rounded-full font-medium transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-subtle font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Cards Grid or Table */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Receipt className="w-8 h-8 text-slate-400" />}
            title="No invoices found"
            description="Create your first commercial tax invoice with custom handling and labour charges."
            actionLabel="Issue Invoice"
            onAction={handleOpenCreateModal}
            actionIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
          />
        </Card>
      ) : viewMode === 'grid' ? (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredInvoices.map((inv) => {
            const cName = getCustomerName(inv);
            const cPhone = getCustomerPhone(inv);
            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-150 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 space-y-2.5">
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono font-black text-slate-900 text-sm block">
                        {inv.invoiceNumber}
                      </span>
                      <p className="text-[11px] text-slate-500">Date: {formatDate(inv.date)}</p>
                    </div>

                    <Badge
                      variant={
                        inv.status === 'Paid'
                          ? 'success'
                          : inv.status === 'Partially Paid'
                          ? 'warning'
                          : 'danger'
                      }
                      dot
                    >
                      {inv.status}
                    </Badge>
                  </div>

                  {/* Customer Information Strip */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-0.5">
                    <p className="font-bold text-slate-900 truncate">{cName}</p>
                    <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{cPhone || 'N/A'}</span>
                      {inv.vehicleNo && (
                        <span className="text-slate-400 font-normal">| 🚛 {inv.vehicleNo}</span>
                      )}
                    </p>
                    {(inv.moveFromAddress || inv.moveToAddress) && (
                      <p className="text-[10px] text-slate-500 truncate pt-0.5">
                        📍 {inv.moveFromAddress?.split(',')[0]} ➔ {inv.moveToAddress?.split(',')[0]}
                      </p>
                    )}
                  </div>

                  {/* Financial Mini Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Total</span>
                      <span className="text-xs font-black text-slate-900 block truncate">
                        {formatCurrency(inv.grandTotal)}
                      </span>
                    </div>
                    <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                      <span className="text-[9px] text-emerald-800 font-bold uppercase block">Paid</span>
                      <span className="text-xs font-black text-emerald-800 block truncate">
                        {formatCurrency(inv.amountPaid)}
                      </span>
                    </div>
                    <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-100">
                      <span className="text-[9px] text-amber-900 font-bold uppercase block">Due</span>
                      <span className="text-xs font-black text-amber-900 block truncate">
                        {formatCurrency(inv.balanceDue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="bg-slate-50/80 p-2.5 border-t border-slate-100 space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadPDF(inv)}
                      className="h-8 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(inv)}
                      className="h-8 px-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* Edit, Preview, Pay */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/50">
                    <button
                      onClick={() => handleOpenEditModal(inv)}
                      className="py-0.5 px-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setIsPreviewModalOpen(true);
                      }}
                      className="py-0.5 px-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>Preview</span>
                    </button>

                    {inv.balanceDue > 0 && (
                      <button
                        onClick={() => handleOpenPaymentModal(inv)}
                        className="py-0.5 px-2 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CreditCard className="w-3 h-3 text-emerald-600" />
                        <span>Pay</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteInvoice(inv)}
                      className="py-0.5 px-2 text-[11px] font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      title="Delete Invoice"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Grand Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => {
                const cName = getCustomerName(inv);
                const cPhone = getCustomerPhone(inv);
                return (
                  <TableRow
                    key={inv.id}
                    isClickable
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setIsPreviewModalOpen(true);
                    }}
                  >
                    <TableCell>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {inv.invoiceNumber}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900 truncate">{cName}</p>
                        <p className="text-[11px] text-slate-500">{cPhone}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700 font-mono">
                        {inv.vehicleNo || 'TN 88 L 5186'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-slate-600 font-medium whitespace-nowrap text-xs">
                        {formatDate(inv.date)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-black text-slate-900 whitespace-nowrap">
                        {formatCurrency(inv.grandTotal)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-emerald-700 whitespace-nowrap">
                        {formatCurrency(inv.amountPaid)}
                      </span>
                    </TableCell>

                    <TableCell>
                      {inv.balanceDue > 0 ? (
                        <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200 whitespace-nowrap">
                          {formatCurrency(inv.balanceDue)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">Paid</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'Paid'
                            ? 'success'
                            : inv.status === 'Partially Paid'
                            ? 'warning'
                            : 'danger'
                        }
                        dot
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(inv)}
                          title="Edit Invoice"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(inv)}
                          title="Download PDF"
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(inv)}
                          title="Send WhatsApp"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => handleOpenPaymentModal(inv)}
                            title="Record Payment"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInvoice(inv)}
                          title="Delete Invoice"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ==================== SUPER SIMPLE & INTUITIVE INVOICE MODAL ==================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingInvoiceId ? 'Edit Tax Invoice' : 'Create Tax Invoice'}
        subtitle="Quickly adjust client, route, handling & labour charges, and payment balance"
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
          {/* 1. Customer & Route Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              1. Customer & Move Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:border-indigo-600 focus:outline-none"
                  placeholder="e.g. Ganesh"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Mobile Phone *</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:border-indigo-600 focus:outline-none"
                  placeholder="9884834664"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Assigned Vehicle No. *</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:border-indigo-600 focus:outline-none"
                  placeholder="TN 88 L 5186"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Move From (Origin) *</label>
                <input
                  type="text"
                  value={moveFromAddress}
                  onChange={(e) => setMoveFromAddress(e.target.value)}
                  className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-indigo-600 focus:outline-none"
                  placeholder="West Mambalam, Chennai"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Move To (Destination) *</label>
                <input
                  type="text"
                  value={moveToAddress}
                  onChange={(e) => setMoveToAddress(e.target.value)}
                  className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-indigo-600 focus:outline-none"
                  placeholder="Senthamizh Nagar, Sivagangai"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Invoice Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Handling & Labour Charges Table */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Handling, Labour & Moving Charges</span>
              </span>

              {/* Quick Add Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleAddPresetItem(
                      'Transportation Freight Charges',
                      12000,
                      'Dedicated shifting vehicle freight'
                    )
                  }
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                >
                  + 🚛 Transport
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddPresetItem(
                      'Handling & Labour Charges',
                      3500,
                      'Loading and unloading assistance'
                    )
                  }
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                >
                  + 👥 Labour/Handling
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddPresetItem(
                      'Packing Materials Charges',
                      2500,
                      'Carton boxes and protection material'
                    )
                  }
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                >
                  + 📦 Packing
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddPresetItem('Custom Charge', 1000, 'Additional shifting service')
                  }
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                >
                  + ➕ Add Custom
                </button>
              </div>
            </div>

            {/* Charges List - Clean & Spacious */}
            <div className="space-y-2 bg-slate-100/70 p-2.5 rounded-2xl border border-slate-200">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-2 transition-all hover:border-slate-300"
                >
                  {/* Top Row: Service Name & Description + Delete */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={item.service}
                        onChange={(e) => handleItemChange(index, 'service', e.target.value)}
                        placeholder="Service Title (e.g. Handling & Labour Charges)"
                        className="w-full font-extrabold text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Details / Specifications (e.g. Loading crew & packing boxes)"
                        className="w-full text-[11px] text-slate-500 px-2.5 py-1 bg-slate-50/50 border border-slate-100 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        title="Remove Charge"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Bottom Row: Rate, Qty & Amount */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      {/* Rate (₹) */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500">Rate (₹):</span>
                        <div className="relative">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-28 sm:w-32 h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 text-right focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Qty */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                          className="w-14 h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Computed Total Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">Total:</span>
                      <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-900 font-black text-xs rounded-lg">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Payment & Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Freight Paid / Advance Received (₹)
                </label>
                <input
                  type="number"
                  value={amountPaidInit}
                  onChange={(e) => setAmountPaidInit(e.target.value)}
                  placeholder="0"
                  className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Special Discount (₹)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-8.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-900 text-white p-3 rounded-xl space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-xs text-amber-300">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discountVal)}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-slate-700 flex justify-between items-center text-sm font-black text-amber-400">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
                <span>Paid Advance:</span>
                <span>{formatCurrency(initPaid)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-amber-200 font-black border-t border-slate-800 pt-1">
                <span>Balance Due:</span>
                <span>{formatCurrency(balanceDue)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingInvoiceId ? 'Save Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================== RECORD PAYMENT MODAL ==================== */}
      {selectedInvoice && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Record Payment — ${selectedInvoice.invoiceNumber}`}
          subtitle={`Customer: ${getCustomerName(selectedInvoice)} • Balance: ${formatCurrency(selectedInvoice.balanceDue)}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
            <Input
              label="Payment Amount (₹) *"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />
            <Select
              label="Payment Method *"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              options={[
                { label: 'UPI / PhonePe / GPay', value: 'UPI' },
                { label: 'Cash Settlement', value: 'Cash' },
                { label: 'Bank Transfer / NEFT', value: 'Bank Transfer' },
                { label: 'Card / Cheque', value: 'Card' },
              ]}
            />
            <Input
              label="Transaction / UTR Reference #"
              placeholder="e.g. UPI-9821739281"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Record Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ==================== DOCUMENT PREVIEW MODAL (CLEAN TAX INVOICE) ==================== */}
      {selectedInvoice && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Tax Invoice"
          subtitle={`Document #${selectedInvoice.invoiceNumber}`}
          maxWidth="3xl"
          footer={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-2">
              <div>
                {selectedInvoice.balanceDue > 0 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsPreviewModalOpen(false);
                      handleOpenPaymentModal(selectedInvoice);
                    }}
                    leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                  >
                    Record Payment ({formatCurrency(selectedInvoice.balanceDue)} Due)
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Paid in Full
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    handleOpenEditModal(selectedInvoice);
                  }}
                  leftIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-600" />}
                >
                  Edit
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print
                </Button>
              </div>
            </div>
          }
        >
          {/* Printable Document Preview matching PDF reference */}
          <div className="space-y-4 bg-white text-xs print:p-0">
            {/* Dark Header Banner */}
            <div className="bg-slate-900 -mx-6 -mt-6 p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="MKM Logo"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 bg-white shrink-0"
                />
                <div>
                  <h2 className="text-base font-black tracking-tight text-white">
                    {settings.companyName.toUpperCase()}
                  </h2>
                  <p className="text-slate-300 text-[11px] max-w-sm mt-0.5 leading-tight">{settings.address}</p>
                  <p className="text-slate-400 text-[10px] mt-1">
                    GSTIN: {settings.gstNumber || '33ADVPU2567L3ZM'} &nbsp;|&nbsp; Phone: 09840546766 &nbsp;|&nbsp; Email: {settings.email}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-amber-400 font-black text-sm uppercase tracking-wider block">
                  TAX INVOICE
                </span>
                <p className="text-sm font-black text-white font-mono mt-0.5">
                  {selectedInvoice.invoiceNumber}
                </p>
                <p className="text-slate-300 text-[11px]">Date: {formatDate(selectedInvoice.date)}</p>
                <p className="text-slate-300 text-[11px]">Due Date: {formatDate(selectedInvoice.dueDate || selectedInvoice.date)}</p>
              </div>
            </div>

            {/* Sub-Cards: Billed To vs Destination & Dispatch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  BILLED TO (CONSIGNOR):
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {getCustomerName(selectedInvoice)}
                </h4>
                <p className="text-slate-600 text-xs">Phone: {getCustomerPhone(selectedInvoice)}</p>
                <p className="text-slate-600 text-xs">
                  Pickup: {selectedInvoice.moveFromAddress || 'West Mambalam, Chennai'}
                </p>
                <div className="pt-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedInvoice.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedInvoice.status === 'Partially Paid'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    Status: {selectedInvoice.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  DESTINATION & DISPATCH DETAILS:
                </span>
                <p className="text-slate-900 font-bold text-xs">
                  Drop: {selectedInvoice.moveToAddress || 'Senthamizh Nagar, Sivagangai'}
                </p>
                <p className="text-slate-600 text-xs">Vehicle: {selectedInvoice.vehicleNo || '14ft Closed Container'}</p>
                <p className="text-slate-600 text-xs">Moving Date: {formatDate(selectedInvoice.dueDate || selectedInvoice.date)}</p>
                <p className="text-indigo-700 font-semibold text-xs">Support Hotline: 09840546766</p>
              </div>
            </div>

            {/* Charges Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-2.5 text-center w-10">#</th>
                    <th className="p-2.5">Service Description</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-center w-14">Qty</th>
                    <th className="p-2.5 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2.5">
                        <p className="font-bold text-slate-900">{item.service}</p>
                        {item.description && (
                          <p className="text-[11px] text-slate-500">{item.description}</p>
                        )}
                      </td>
                      <td className="p-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2.5 text-center">{item.qty}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Box & Words */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Rupees in Words:</span>
                <p className="text-slate-900 font-bold text-xs">
                  {numberToWordsIndian(selectedInvoice.grandTotal)}
                </p>
                {selectedInvoice.notes && (
                  <div className="pt-2 border-t border-slate-200/80 mt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Terms & Remarks:</span>
                    <p className="text-slate-600 text-[11px]">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Discount:</span>
                    <span>-{formatCurrency(selectedInvoice.discount)}</span>
                  </div>
                )}
                {selectedInvoice.tax > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>GST Tax ({settings.taxRate}%):</span>
                    <span className="font-bold text-slate-900">{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(selectedInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-emerald-700">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(selectedInvoice.amountPaid)}</span>
                </div>
                <div className={`flex justify-between items-center text-xs font-bold ${
                  selectedInvoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  <span>Balance Due:</span>
                  <span>{formatCurrency(selectedInvoice.balanceDue)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
