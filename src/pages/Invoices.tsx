import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { useAppContext } from '../store/AppContext';
import {
  Search,
  Plus,
  Receipt,
  Download,
  Printer,
  Trash2,
  Eye,
  MessageCircle,
  Edit3,
  Building,
  PlusCircle,
  X,
} from 'lucide-react';
import { Invoice, QuotationItem } from '../types';
import { generateInvoicePDF, formatRupeeDoc, formatInvoiceDate } from '../utils/pdfExport';
import { MKM_LOGO_BASE64 } from '../assets/logo';

export const Invoices = () => {
  const {
    invoices,
    settings,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    generateNextInvoiceNumber,
  } = useAppContext();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Form State matching physical invoice
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [poNumber, setPoNumber] = useState('');
  const [gstType, setGstType] = useState('NILL'); // 'NILL' or '18% GST (9% CGST + 9% SGST)'
  const [customGstin, setCustomGstin] = useState('');

  // Bill To details
  const [customerName, setCustomerName] = useState('The Executive Engineer');
  const [divisionDept, setDivisionDept] = useState('AOBM');
  const [organizationAddress, setOrganizationAddress] = useState(
    'Chennai Metropolitan Water Supply\nChennai 600028.'
  );
  const [customerPhone, setCustomerPhone] = useState('');

  // Line items
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: '1',
      service: "Transportation charges for Office Furniture's",
      description:
        'Amma Maaligai Chennai Central to CMWSSB Head Office Chintadripet\nThe rate inclusive of packing material, loading and un-loading charges',
      qty: 1,
      unitPrice: 14000,
      discount: 0,
      amount: 14000,
    },
  ]);

  const [otherCharges, setOtherCharges] = useState('0');

  // Totals calculations
  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  };

  const calculateTax = () => {
    if (gstType.includes('18%')) {
      return Math.round(calculateSubtotal() * 0.18);
    }
    return 0;
  };

  const calculateGrandTotal = () => {
    const sub = calculateSubtotal();
    const tax = calculateTax();
    const other = Number(otherCharges) || 0;
    return sub + tax + other;
  };

  // Open modal for new invoice
  const handleOpenAdd = async () => {
    setEditingInvoiceId(null);
    try {
      const nextNum = await generateNextInvoiceNumber();
      setInvoiceNumber(nextNum);
    } catch {
      setInvoiceNumber(`INV-${Date.now().toString().slice(-4)}`);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setPoNumber('');
    setGstType('NILL');
    setCustomGstin('');
    setCustomerName('The Executive Engineer');
    setDivisionDept('AOBM');
    setOrganizationAddress('Chennai Metropolitan Water Supply\nChennai 600028.');
    setCustomerPhone('');
    setItems([
      {
        id: '1',
        service: "Transportation charges for Office Furniture's",
        description:
          'Amma Maaligai Chennai Central to CMWSSB Head Office Chintadripet\nThe rate inclusive of packing material, loading and un-loading charges',
        qty: 1,
        unitPrice: 14000,
        discount: 0,
        amount: 14000,
      },
    ]);
    setOtherCharges('0');
    setIsAddModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (inv: Invoice) => {
    setEditingInvoiceId(inv.id);
    setInvoiceNumber(inv.invoiceNumber);
    setDate(inv.date);
    setPoNumber(inv.poNumber || '');
    setGstType(inv.gstType || (inv.tax > 0 ? '18% GST (9% CGST + 9% SGST)' : 'NILL'));
    setCustomGstin(inv.customerGst || '');
    setCustomerName(inv.customerName || 'The Executive Engineer');

    // Parse bill to lines
    if (inv.billToDetails) {
      const lines = inv.billToDetails.split('\n');
      setCustomerName(lines[0] || inv.customerName || '');
      setDivisionDept(lines[1] || '');
      setOrganizationAddress(lines.slice(2).join('\n') || '');
    } else {
      setDivisionDept('');
      setOrganizationAddress(inv.moveToAddress || '');
    }

    setCustomerPhone(inv.customerPhone || '');
    setItems(
      inv.items && inv.items.length > 0
        ? inv.items
        : [
            {
              id: '1',
              service: "Transportation charges for Office Furniture's",
              description:
                'Amma Maaligai Chennai Central to CMWSSB Head Office Chintadripet\nThe rate inclusive of packing material, loading and un-loading charges',
              qty: 1,
              unitPrice: inv.subtotal || inv.grandTotal,
              discount: 0,
              amount: inv.subtotal || inv.grandTotal,
            },
          ]
    );
    setOtherCharges(String(inv.otherCharges || '0'));
    setIsAddModalOpen(true);
  };

  // Save invoice to Firestore
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toastError('Validation Error', 'Please enter customer / attention name.');
      return;
    }

    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const other = Number(otherCharges) || 0;
    const grandTotal = subtotal + tax + other;

    const billToDetails = [customerName.trim(), divisionDept.trim(), organizationAddress.trim()]
      .filter(Boolean)
      .join('\n');

    const invoicePayload: Invoice = {
      id: editingInvoiceId || `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim() || `INV-${Date.now().toString().slice(-4)}`,
      customerId: 'custom-client',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: '',
      customerGst: gstType === 'NILL' ? 'NILL' : customGstin.trim() || 'GST Registered',
      gstType: gstType === 'NILL' ? 'NILL' : customGstin.trim() || 'GST 18%',
      poNumber: poNumber.trim(),
      billToDetails,
      moveToAddress: organizationAddress.trim(),
      date,
      dueDate: date,
      items,
      subtotal,
      tax,
      centralTax: tax > 0 ? tax / 2 : 0,
      stateTax: tax > 0 ? tax / 2 : 0,
      otherCharges: other,
      grandTotal,
      amountPaid: grandTotal,
      balanceDue: 0,
      discount: 0,
      status: 'Paid',
      notes: 'Payment is requested upon unloading & final delivery.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingInvoiceId) {
        await updateInvoice(invoicePayload);
        success('Invoice Updated', `Invoice ${invoicePayload.invoiceNumber} updated in Firestore.`);
      } else {
        await addInvoice(invoicePayload);
        success('Invoice Stored', `Invoice ${invoicePayload.invoiceNumber} saved to Cloud Firestore.`);
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      toastError('Save Error', err?.message || 'Could not save invoice to Firestore.');
    }
  };

  // Delete invoice
  const handleDelete = async (id: string, number: string) => {
    if (window.confirm(`Are you sure you want to delete Invoice ${number}?`)) {
      try {
        await deleteInvoice(id);
        success('Invoice Deleted', `Invoice ${number} removed from Firestore.`);
      } catch (err: any) {
        toastError('Delete Failed', err?.message || 'Unable to delete invoice.');
      }
    }
  };

  // WhatsApp Share
  const handleShareWhatsApp = (inv: Invoice) => {
    const phone = inv.customerPhone ? inv.customerPhone.replace(/[^0-9]/g, '') : '';
    const name = inv.customerName || 'Customer';
    const message = `*INVOICE: ${inv.invoiceNumber}*
MKM PACKERS AND MOVERS
---------------------------------
Client: ${name}
Date: ${formatInvoiceDate(inv.date)}
${inv.poNumber ? `PO No: ${inv.poNumber}\n` : ''}
*Total Amount: Rs. ${inv.grandTotal.toLocaleString('en-IN')}/-*

Thank you for choosing MKM Packers & Movers!
Hotline: ${settings.phone || '98405 46766, 93423 06048'}`;

    const url = phone
      ? `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Filtered invoices (search only)
  const filteredInvoices = invoices.filter((inv) => {
    return (
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.billToDetails || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customerPhone || '').includes(searchTerm) ||
      (inv.poNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE5DC] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#E8DFD1] flex items-center justify-center text-[#9E7B4F] shadow-2xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#1A1D20] tracking-tight">
                Tax Invoices
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5EDE2] text-[#9E7B4F] border border-[#DFC9AE]">
                {invoices.length} Total
              </span>
            </div>
            <p className="text-[11px] text-[#718292] font-normal">
              Official MKM customer tax invoices stored in Cloud Firestore
            </p>
          </div>
        </div>

        <Button
          id="btn-create-invoice"
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4 text-white" />}
          className="w-full sm:w-auto font-bold bg-[#9E7B4F] hover:bg-[#8A6A3E] text-white px-4 py-2 rounded-xl text-xs shadow-xs"
        >
          Create New Invoice
        </Button>
      </div>

      {/* Clean Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-[#EAE5DC] shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8C9CAE]" />
          <input
            type="text"
            placeholder="Search by Invoice #, client name, address, PO No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9E7B4F] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Invoices List - High-Visibility, Mobile-Optimized Cards */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          title="No Invoices Found"
          description={
            searchTerm
              ? 'No invoices match your search query.'
              : 'Create your first Tax Invoice to store in Firestore.'
          }
          icon={<Receipt className="w-6 h-6" />}
          action={
            <Button
              variant="primary"
              onClick={handleOpenAdd}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-[#9E7B4F] hover:bg-[#8A6A3E]"
            >
              Create New Invoice
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white border border-[#EAE5DC] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Card Top: Invoice #, PO Badge, Date */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[#F5F1E8]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] border border-[#E8DFD1] flex items-center justify-center text-[#9E7B4F] shrink-0 font-black text-sm">
                    #
                  </div>
                  <div className="min-w-0">
                    <span className="font-black text-base sm:text-lg text-[#1A1D20] tracking-tight block truncate">
                      {inv.invoiceNumber}
                    </span>
                    {inv.poNumber && (
                      <span className="text-[10px] font-bold text-[#9E7B4F]">
                        PO No: {inv.poNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#506070] font-bold bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EAE5DC]">
                    {formatInvoiceDate(inv.date)}
                  </span>
                </div>
              </div>

              {/* Client & Movement Info */}
              <div className="space-y-1">
                <p className="font-black text-base text-[#1A1D20] tracking-tight truncate">
                  {inv.customerName || 'The Executive Engineer'}
                </p>
                <p className="text-xs text-[#718292] truncate flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#9E7B4F] shrink-0" />
                  <span>
                    {inv.billToDetails?.split('\n')[1] || inv.moveToAddress || 'Chennai Central'}
                  </span>
                </p>
              </div>

              {/* Prominent Grand Total Box */}
              <div className="bg-[#FAF8F5] border border-[#EAE5DC] p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-[#718292] uppercase tracking-wider">
                  Grand Total
                </span>
                <span className="font-black text-lg sm:text-xl text-[#1A1D20]">
                  {formatRupeeDoc(inv.grandTotal)}
                </span>
              </div>

              {/* Action Buttons: Big & Touch-Friendly on Mobile */}
              <div className="pt-2 border-t border-[#F5F1E8] space-y-2">
                {/* Primary Actions: Preview, PDF, WhatsApp */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setIsPreviewModalOpen(true);
                    }}
                    className="h-10 inline-flex items-center justify-center gap-1.5 px-3 bg-[#FAF6F0] hover:bg-[#F5EDE2] active:scale-98 text-[#9E7B4F] border border-[#DFC9AE] font-bold rounded-xl text-xs transition-all cursor-pointer shadow-2xs"
                    title="View paper preview"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => generateInvoicePDF(inv, undefined, settings)}
                    className="h-10 inline-flex items-center justify-center gap-1.5 px-3 bg-[#FAF8F5] hover:bg-[#F0EBE1] active:scale-98 text-[#1A1D20] border border-[#EAE5DC] font-bold rounded-xl text-xs transition-all cursor-pointer shadow-2xs"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4 text-[#718292]" />
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(inv)}
                    className="h-10 inline-flex items-center justify-center gap-1.5 px-3 text-emerald-800 hover:bg-emerald-100 active:scale-98 bg-[#E8F8F0] border border-emerald-300 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-2xs"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* Secondary Actions: Edit & Delete */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(inv)}
                    className="h-9 inline-flex items-center justify-center gap-1.5 px-3 text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 border border-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    title="Edit Invoice"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                    className="h-9 inline-flex items-center justify-center gap-1.5 px-3 text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-98 border border-rose-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    title="Delete Invoice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== CREATE / EDIT INVOICE MODAL ==================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingInvoiceId ? `Edit Invoice: ${invoiceNumber}` : 'Generate Tax Invoice'}
        size="lg"
      >
        <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
          {/* Top Meta Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <Input
              label="Invoice Number *"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
            <Input
              label="Invoice Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="PO Number (Optional)"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-9842"
            />
          </div>

          {/* GST Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="GST Tax Rate"
              value={gstType}
              onChange={(e) => setGstType(e.target.value)}
              options={[
                { value: 'NILL', label: 'NILL (No GST Tax Applicable)' },
                { value: '18% GST (9% CGST + 9% SGST)', label: '18% GST (9% CGST + 9% SGST)' },
              ]}
            />
            {gstType.includes('18%') && (
              <Input
                label="Customer GSTIN Number"
                value={customGstin}
                onChange={(e) => setCustomGstin(e.target.value)}
                placeholder="33ADVPU2567L3ZM"
              />
            )}
          </div>

          {/* BILL TO Block (Email removed) */}
          <div className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#DFC9AE] space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-[#1A1D20] text-xs">
              <Building className="w-3.5 h-3.5 text-[#9E7B4F]" />
              <span>BILL TO (Consignee / Organization Details)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Customer / Attention Title *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="The Executive Engineer"
                required
              />
              <Input
                label="Department / Division"
                value={divisionDept}
                onChange={(e) => setDivisionDept(e.target.value)}
                placeholder="AOBM"
              />
            </div>

            <Textarea
              label="Organization Name & Address *"
              rows={2}
              value={organizationAddress}
              onChange={(e) => setOrganizationAddress(e.target.value)}
              placeholder="Chennai Metropolitan Water Supply, Chennai 600028."
              required
            />

            <Input
              label="Customer Contact Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="98405 46766"
            />
          </div>

          {/* Particulars / Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Particulars / Description</span>
              <button
                type="button"
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      service: 'Additional Loading / Transport Charges',
                      description: '',
                      qty: 1,
                      unitPrice: 2000,
                      discount: 0,
                      amount: 2000,
                    },
                  ])
                }
                className="text-xs font-bold text-[#9E7B4F] hover:text-[#8A6A3E] flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      label="Service Title"
                      value={item.service}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].service = e.target.value;
                        setItems(updated);
                      }}
                      placeholder="Transportation charges for Office Furniture's"
                    />
                    <Textarea
                      label="Detailed Description"
                      rows={2}
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].description = e.target.value;
                        setItems(updated);
                      }}
                      placeholder="Amma Maaligai Chennai Central to CMWSSB Head Office Chintadripet..."
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer mt-5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex justify-end">
                  <div className="w-44">
                    <Input
                      label="Amount (Rs.) *"
                      type="number"
                      value={item.amount}
                      onChange={(e) => {
                        const updated = [...items];
                        const val = Number(e.target.value) || 0;
                        updated[idx].unitPrice = val;
                        updated[idx].amount = val;
                        setItems(updated);
                      }}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span className="font-bold text-white">{formatRupeeDoc(calculateSubtotal())}</span>
            </div>
            {gstType.includes('18%') && (
              <>
                <div className="flex justify-between text-slate-300">
                  <span>Central Tax 9%:</span>
                  <span>{formatRupeeDoc(calculateTax() / 2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>State Tax 9%:</span>
                  <span>{formatRupeeDoc(calculateTax() / 2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center text-slate-300">
              <span>Other Charges:</span>
              <input
                type="number"
                value={otherCharges}
                onChange={(e) => setOtherCharges(e.target.value)}
                className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-right text-white font-mono text-xs"
              />
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm font-extrabold text-amber-400">
              <span>TOTAL INVOICE AMOUNT:</span>
              <span className="text-base">{formatRupeeDoc(calculateGrandTotal())}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="bg-[#9E7B4F] hover:bg-[#8A6A3E] text-white"
            >
              {editingInvoiceId ? 'Save Changes' : 'Store Invoice in Firestore'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================== EXACT PHYSICAL INVOICE PREVIEW MODAL ==================== */}
      {selectedInvoice && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Invoice Preview: ${selectedInvoice.invoiceNumber}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex justify-end gap-2 bg-slate-100 p-2 rounded-xl">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print Direct
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => generateInvoicePDF(selectedInvoice, undefined, settings)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="bg-[#9E7B4F] hover:bg-[#8A6A3E] text-white"
              >
                Download PDF
              </Button>
            </div>

            {/* Paper Document Preview */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-md font-sans text-slate-900 space-y-6 max-w-2xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 min-w-0 max-w-[60%]">
                  <img
                    src={
                      settings.logoUrl && settings.logoUrl.startsWith('data:')
                        ? settings.logoUrl
                        : MKM_LOGO_BASE64
                    }
                    alt="MKM Logo"
                    className="w-12 h-12 rounded-full object-contain ring-1 ring-cyan-600 bg-white shrink-0 p-0.5"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <h1 className="text-base font-black text-[#2B7A9B] tracking-wide uppercase truncate">
                      {settings.companyName || 'MKM PACKERS AND MOVERS'}
                    </h1>
                    <p className="text-[10px] font-bold text-slate-800 leading-tight whitespace-pre-line">
                      {settings.address ||
                        'NEW NO 13 OLD NO 6, VALLALAR STREET,\nPADMANABA NAGAR, CHOOLAIMEDU, CHENNAI 600 094.'}
                    </p>
                    <p className="text-[10px] text-slate-700">Phone: {settings.phone || '98405 46766, 93423 06048'}</p>
                    <p className="text-[10px] text-slate-700">Website: {settings.website || 'www.mkmpackersandmovers.com'}</p>
                    <p className="text-[10px] text-slate-700">Mail: {settings.email || 'mkmpackersandmovers@gmail.com'}</p>
                  </div>
                </div>

                <div className="text-right space-y-1.5">
                  <h2 className="text-2xl font-black text-[#5B9BD5] uppercase tracking-wider">INVOICE</h2>
                  <table className="text-[10px] border border-slate-300 border-collapse ml-auto">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="px-2 py-1 font-bold bg-slate-50 border-r border-slate-300 text-left">DATE</td>
                        <td className="px-3 py-1 text-left">{formatInvoiceDate(selectedInvoice.date)}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="px-2 py-1 font-bold bg-slate-100 border-r border-slate-300 text-left">INVOICE #</td>
                        <td className="px-3 py-1 font-semibold text-left">{selectedInvoice.invoiceNumber}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="px-2 py-1 font-bold bg-slate-50 border-r border-slate-300 text-left">GST</td>
                        <td className="px-3 py-1 text-left">{selectedInvoice.gstType || 'NILL'}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 font-bold bg-slate-100 border-r border-slate-300 text-left">PO NO:</td>
                        <td className="px-3 py-1 text-left">{selectedInvoice.poNumber || ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BILL TO Banner */}
              <div className="space-y-2">
                <div className="bg-[#2B7A9B] text-white px-3 py-1 font-bold text-xs inline-block w-48 uppercase tracking-wider">
                  BILL TO
                </div>
                <div className="pl-3 text-xs font-bold text-slate-900 whitespace-pre-line leading-relaxed">
                  {selectedInvoice.billToDetails ||
                    `${selectedInvoice.customerName}\nAOBM\nChennai Metropolitan Water Supply\nChennai 600028.`}
                </div>
              </div>

              {/* DESCRIPTION TABLE */}
              <div className="border border-[#2B7A9B] rounded-none overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#2B7A9B] text-white font-bold">
                      <th className="px-3 py-1.5 text-left border-r border-white/30">DESCRIPTION</th>
                      <th className="px-2 py-1.5 text-center border-r border-white/30 w-16">TAXED</th>
                      <th className="px-3 py-1.5 text-right w-28">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="px-3 py-2 text-slate-800 border-r border-slate-200">
                            <div className="font-semibold">{item.service}</div>
                            {item.description && (
                              <div className="text-[11px] text-slate-600 whitespace-pre-line mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center border-r border-slate-200 text-slate-400">
                            {selectedInvoice.tax > 0 ? '✓' : ''}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">
                            {formatRupeeDoc(item.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-slate-200">
                        <td className="px-3 py-2 text-slate-800 border-r border-slate-200 whitespace-pre-line">
                          Transportation charges for Office Furniture's<br />
                          Amma Maaligai Chennai Central to CMWSSB Head Office Chintadripet<br />
                          The rate inclusive of packing material, loading and un-loading charges
                        </td>
                        <td className="px-2 py-2 text-center border-r border-slate-200"></td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900">
                          {formatRupeeDoc(selectedInvoice.grandTotal)}
                        </td>
                      </tr>
                    )}
                    {/* Visual padding row */}
                    <tr className="h-16 border-b border-slate-200 bg-slate-50/40">
                      <td className="border-r border-slate-200"></td>
                      <td className="border-r border-slate-200"></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SUMMARY TABLE */}
              <div className="flex justify-end">
                <table className="text-xs border border-slate-200 w-64 border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="px-3 py-1 font-bold text-right text-slate-700">Subtotal</td>
                      <td className="px-3 py-1 text-right font-bold border-l border-slate-200">
                        {formatRupeeDoc(selectedInvoice.subtotal || selectedInvoice.grandTotal)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="px-3 py-1 font-normal text-right text-slate-700">Taxable</td>
                      <td className="px-3 py-1 border-l border-slate-200"></td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="px-3 py-1 font-normal text-right text-slate-700">Central Tax 9%</td>
                      <td className="px-3 py-1 text-right border-l border-slate-200">
                        {selectedInvoice.tax > 0 ? formatRupeeDoc(selectedInvoice.tax / 2) : 'Nill'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="px-3 py-1 font-normal text-right text-slate-700">State Tax 9%</td>
                      <td className="px-3 py-1 text-right border-l border-slate-200">
                        {selectedInvoice.tax > 0 ? formatRupeeDoc(selectedInvoice.tax / 2) : ''}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="px-3 py-1 font-normal text-right text-slate-700">Other</td>
                      <td className="px-3 py-1 text-right border-l border-slate-200">
                        {selectedInvoice.otherCharges ? formatRupeeDoc(selectedInvoice.otherCharges) : 'Nill'}
                      </td>
                    </tr>
                    <tr className="bg-[#C5E0F5] font-black border-t-2 border-[#2B7A9B]">
                      <td className="px-3 py-1.5 text-right text-slate-900 font-bold">TOTAL</td>
                      <td className="px-3 py-1.5 text-right font-bold text-slate-950 border-l border-[#2B7A9B]">
                        {formatRupeeDoc(selectedInvoice.grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Sign-off */}
              <div className="pt-4 text-right">
                <p className="text-xs font-normal text-slate-800">
                  For <span className="font-bold text-[#2B7A9B]">MKM PACKERS AND MOVERS</span>
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
