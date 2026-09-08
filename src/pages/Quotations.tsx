import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { useAppContext } from '../store/AppContext';
import {
  Search,
  Plus,
  FileText,
  Download,
  Printer,
  Trash2,
  Eye,
  MessageCircle,
  Edit3,
  Building,
  PlusCircle,
  X,
  FileCheck,
} from 'lucide-react';
import { Quotation, QuotationItem, Invoice } from '../types';
import { generateQuotationPDF, formatRupeeDoc, formatQuotationDate } from '../utils/pdfExport';
import { MKM_LOGO_BASE64 } from '../assets/logo';

export const Quotations = () => {
  const navigate = useNavigate();
  const {
    quotations,
    settings,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    generateNextQuotationNumber,
    addInvoice,
    generateNextInvoiceNumber,
  } = useAppContext();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Form state matching physical quotation
  const [quotationNumber, setQuotationNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Recipient "To" details
  const [customerName, setCustomerName] = useState('The Executive Engineer');
  const [divisionDept, setDivisionDept] = useState('AOBM');
  const [organizationAddress, setOrganizationAddress] = useState(
    'Chennai Metropolitan Water Supply\nChennai 600028.'
  );
  const [customerPhone, setCustomerPhone] = useState('');

  // Subject & Intro paragraph
  const [subject, setSubject] = useState(
    "Sub: Shifting of OFFICE FURNITURE'S FROM AMMA MALIGAI CHENNAI CENTRAL TO CMWSSB HEAD OFFICE, CHINTADRIPET, Chennai."
  );
  const [introParagraph, setIntroParagraph] = useState(
    'Kindly refer to our discussion regarding the above subject. We are giving below here with our quotation and other terms and conditions. Hope you will find our quotation competitive and we assure for the best service. The scope of work would be packing and moving goods'
  );

  // Particulars items
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: '1',
      service: 'PACKING CHARGES, PACKING MATERIALS, TRANSPORT, LOADING CHARGES AND UNLOADING CHARGES.',
      description: '',
      qty: 1,
      unitPrice: 14000,
      discount: 0,
      amount: 14000,
    },
  ]);

  // Terms & Conditions list
  const defaultTermsList = [
    'Payment: 100% to be paid at the time of loading.',
    'This quote is valid for 14 days from this day',
    'Rate will be varied if packing material or load exceed at the time of packing and movement.',
    'Insurance 2% of declared value.',
    'Maximum load 1 tons to 1.5 tons only will be loaded',
  ];
  const [termsList, setTermsList] = useState<string[]>(defaultTermsList);

  // Open modal for new quotation
  const handleOpenAdd = async () => {
    setEditingQuoteId(null);
    try {
      const nextNum = await generateNextQuotationNumber();
      setQuotationNumber(nextNum);
    } catch {
      setQuotationNumber(`QT-${Date.now().toString().slice(-4)}`);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setCustomerName('The Executive Engineer');
    setDivisionDept('AOBM');
    setOrganizationAddress('Chennai Metropolitan Water Supply\nChennai 600028.');
    setCustomerPhone('');
    setSubject(
      "Sub: Shifting of OFFICE FURNITURE'S FROM AMMA MALIGAI CHENNAI CENTRAL TO CMWSSB HEAD OFFICE, CHINTADRIPET, Chennai."
    );
    setIntroParagraph(
      'Kindly refer to our discussion regarding the above subject. We are giving below here with our quotation and other terms and conditions. Hope you will find our quotation competitive and we assure for the best service. The scope of work would be packing and moving goods'
    );
    setItems([
      {
        id: '1',
        service: 'PACKING CHARGES, PACKING MATERIALS, TRANSPORT, LOADING CHARGES AND UNLOADING CHARGES.',
        description: '',
        qty: 1,
        unitPrice: 14000,
        discount: 0,
        amount: 14000,
      },
    ]);
    setTermsList(defaultTermsList);
    setIsAddModalOpen(true);
  };

  // Open modal for editing quotation
  const handleOpenEdit = (q: Quotation) => {
    setEditingQuoteId(q.id);
    setQuotationNumber(q.quotationNumber);
    setDate(q.date);
    setCustomerName(q.customerName || 'The Executive Engineer');

    if (q.toDetails) {
      const lines = q.toDetails.split('\n');
      setCustomerName(lines[0] || q.customerName || '');
      setDivisionDept(lines[1] || '');
      setOrganizationAddress(lines.slice(2).join('\n') || '');
    } else {
      setDivisionDept('');
      setOrganizationAddress(q.dropAddress || '');
    }

    setCustomerPhone(q.customerPhone || '');
    setSubject(
      q.subject ||
        `Sub: Shifting of OFFICE FURNITURE'S FROM ${q.pickupAddress || 'Origin'} TO ${q.dropAddress || 'Destination'}.`
    );
    setIntroParagraph(
      q.introParagraph ||
        'Kindly refer to our discussion regarding the above subject. We are giving below here with our quotation and other terms and conditions. Hope you will find our quotation competitive and we assure for the best service. The scope of work would be packing and moving goods'
    );
    setItems(
      q.items && q.items.length > 0
        ? q.items
        : [
            {
              id: '1',
              service:
                'PACKING CHARGES, PACKING MATERIALS, TRANSPORT, LOADING CHARGES AND UNLOADING CHARGES.',
              description: '',
              qty: 1,
              unitPrice: q.grandTotal || 14000,
              discount: 0,
              amount: q.grandTotal || 14000,
            },
          ]
    );
    setTermsList(q.termsList && q.termsList.length > 0 ? q.termsList : defaultTermsList);
    setIsAddModalOpen(true);
  };

  // Calculate grand total
  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  };

  // Save quotation to Firestore
  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toastError('Validation Error', 'Please enter customer / attention name.');
      return;
    }

    const total = calculateTotal();
    const toDetails = [customerName.trim(), divisionDept.trim(), organizationAddress.trim()]
      .filter(Boolean)
      .join('\n');

    const quotationPayload: Quotation = {
      id: editingQuoteId || `qt-${Date.now()}`,
      quotationNumber: quotationNumber.trim() || `QT-${Date.now().toString().slice(-4)}`,
      customerId: 'custom-client',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: '',
      customerAddress: organizationAddress.trim(),
      toDetails,
      subject: subject.trim(),
      introParagraph: introParagraph.trim(),
      termsList,
      date,
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      movingDate: date,
      pickupAddress: '',
      dropAddress: organizationAddress.trim(),
      propertyType: 'Office',
      floor: 'Ground Floor',
      lift: true,
      parking: true,
      distance: '',
      vehicleType: '14ft Closed Container',
      items,
      subtotal: total,
      discount: 0,
      tax: 0,
      grandTotal: total,
      notes: termsList.join('\n'),
      status: 'Sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingQuoteId) {
        await updateQuotation(quotationPayload);
        success('Quotation Updated', `Quotation ${quotationPayload.quotationNumber} updated.`);
      } else {
        await addQuotation(quotationPayload);
        success('Quotation Stored', `Quotation ${quotationPayload.quotationNumber} saved to Firestore.`);
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      toastError('Save Error', err?.message || 'Could not save quotation.');
    }
  };

  // Convert Quotation into Tax Invoice
  const handleConvertToInvoice = async (q: Quotation) => {
    try {
      const nextInvNum = await generateNextInvoiceNumber();
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: nextInvNum,
        customerId: q.customerId || 'custom-client',
        customerName: q.customerName || 'The Executive Engineer',
        customerPhone: q.customerPhone || '',
        customerEmail: '',
        customerGst: 'NILL',
        gstType: 'NILL',
        poNumber: '',
        billToDetails: q.toDetails || `${q.customerName}\nAOBM\n${q.dropAddress}`,
        moveToAddress: q.dropAddress || '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        quotationId: q.id,
        items:
          q.items && q.items.length > 0
            ? q.items
            : [
                {
                  id: '1',
                  service: "Transportation charges for Office Furniture's",
                  description:
                    'Amma Maaligai Chennai Central to CMWSSB Head Office Chintadripet\nThe rate inclusive of packing material, loading and un-loading charges',
                  qty: 1,
                  unitPrice: q.grandTotal,
                  discount: 0,
                  amount: q.grandTotal,
                },
              ],
        subtotal: q.grandTotal,
        discount: 0,
        tax: 0,
        otherCharges: 0,
        grandTotal: q.grandTotal,
        amountPaid: q.grandTotal,
        balanceDue: 0,
        status: 'Paid',
        notes: 'Converted from Quotation ' + q.quotationNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addInvoice(newInvoice);
      success('Converted to Invoice', `Created Invoice ${newInvoice.invoiceNumber} from Quotation ${q.quotationNumber}`);
      navigate('/invoices');
    } catch (err: any) {
      toastError('Conversion Failed', err?.message || 'Unable to generate invoice from quotation.');
    }
  };

  // Delete quotation
  const handleDelete = async (id: string, number: string) => {
    if (window.confirm(`Delete Quotation ${number}?`)) {
      try {
        await deleteQuotation(id);
        success('Quotation Deleted', `Quotation ${number} removed.`);
      } catch (err: any) {
        toastError('Delete Failed', err?.message || 'Unable to delete quotation.');
      }
    }
  };

  // WhatsApp Share
  const handleShareWhatsApp = (q: Quotation) => {
    const phone = q.customerPhone ? q.customerPhone.replace(/[^0-9]/g, '') : '';
    const message = `*QUOTATION: ${q.quotationNumber}*
MKM PACKERS AND MOVERS
---------------------------------
Date: ${formatQuotationDate(q.date)}
${q.subject || ''}

*Total Estimated Rate: Rs. ${q.grandTotal.toLocaleString('en-IN')}/-*

TERMS & CONDITIONS:
1. Payment: 100% to be paid at the time of loading.
2. This quote is valid for 14 days.
3. Insurance 2% of declared value.

We assure for the best service!
MKM Packers & Movers Hotline: ${settings.phone || '98405 46766, 93423 06048'}`;

    const url = phone
      ? `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Filtered quotations (search only)
  const filteredQuotations = quotations.filter((q) => {
    return (
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.toDetails || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.customerPhone || '').includes(searchTerm)
    );
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE5DC] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#E8DFD1] flex items-center justify-center text-[#9E7B4F] shadow-2xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#1A1D20] tracking-tight">
                Quotations & Estimates
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5EDE2] text-[#9E7B4F] border border-[#DFC9AE]">
                {quotations.length} Total
              </span>
            </div>
            <p className="text-[11px] text-[#718292] font-normal">
              Official MKM customer quotation estimates stored in Cloud Firestore
            </p>
          </div>
        </div>

        <Button
          id="btn-create-quotation"
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4 text-white" />}
          className="w-full sm:w-auto font-bold bg-[#9E7B4F] hover:bg-[#8A6A3E] text-white px-4 py-2 rounded-xl text-xs shadow-xs"
        >
          Create New Quotation
        </Button>
      </div>

      {/* Clean Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-[#EAE5DC] shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#8C9CAE]" />
          <input
            type="text"
            placeholder="Search by Quote #, client name, subject, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9E7B4F] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Quotations List - High-Visibility, Mobile-Optimized Cards */}
      {filteredQuotations.length === 0 ? (
        <EmptyState
          title="No Quotations Found"
          description={
            searchTerm
              ? 'No quotation matches your search query.'
              : 'Create your first professional formal moving quotation.'
          }
          icon={<FileText className="w-6 h-6" />}
          action={
            <Button
              variant="primary"
              onClick={handleOpenAdd}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-[#9E7B4F] hover:bg-[#8A6A3E]"
            >
              Create New Quotation
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredQuotations.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-[#EAE5DC] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Card Top: Quotation #, Date */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[#F5F1E8]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] border border-[#E8DFD1] flex items-center justify-center text-[#9E7B4F] shrink-0 font-black text-xs">
                    QT
                  </div>
                  <span className="font-black text-base sm:text-lg text-[#1A1D20] tracking-tight truncate">
                    {q.quotationNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#506070] font-bold bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EAE5DC]">
                    {formatQuotationDate(q.date)}
                  </span>
                </div>
              </div>

              {/* Client & Subject */}
              <div className="space-y-1">
                <p className="font-black text-base text-[#1A1D20] tracking-tight truncate">
                  {q.customerName || 'The Executive Engineer'}
                </p>
                <p className="text-xs text-[#718292] truncate flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#9E7B4F] shrink-0" />
                  <span>{q.subject || 'Shifting of Office Furniture'}</span>
                </p>
              </div>

              {/* Prominent Estimated Rate Box */}
              <div className="bg-[#FAF8F5] border border-[#EAE5DC] p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-[#718292] uppercase tracking-wider">
                  Estimated Rate
                </span>
                <span className="font-black text-lg sm:text-xl text-[#1A1D20]">
                  {formatRupeeDoc(q.grandTotal)}
                </span>
              </div>

              {/* Action Buttons: Big & Touch-Friendly on Mobile */}
              <div className="pt-2 border-t border-[#F5F1E8] space-y-2">
                {/* Primary Actions: Preview, PDF, To Invoice, WhatsApp */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuote(q);
                      setIsPreviewModalOpen(true);
                    }}
                    className="h-10 inline-flex items-center justify-center gap-1.5 px-2.5 bg-[#FAF6F0] hover:bg-[#F5EDE2] active:scale-98 text-[#9E7B4F] border border-[#DFC9AE] font-bold rounded-xl text-xs transition-all cursor-pointer shadow-2xs"
                    title="View paper preview"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => generateQuotationPDF(q, undefined, settings)}
                    className="h-10 inline-flex items-center justify-center gap-1.5 px-2.5 bg-[#FAF8F5] hover:bg-[#F0EBE1] active:scale-98 text-[#1A1D20] border border-[#EAE5DC] font-bold rounded-xl text-xs transition-all cursor-pointer shadow-2xs"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4 text-[#718292]" />
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConvertToInvoice(q)}
                    className="h-10 inline-flex items-center justify-center gap-1.5 px-2.5 bg-[#E6F7F0] hover:bg-[#D1F2E2] active:scale-98 text-[#1B9B6A] border border-[#BDEBD6] font-bold rounded-xl text-xs transition-all cursor-pointer shadow-2xs"
                    title="Convert to Invoice"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>To Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(q)}
                    className="h-10 inline-flex items-center justify-center gap-1.5 px-2.5 text-emerald-800 hover:bg-emerald-100 active:scale-98 bg-[#E8F8F0] border border-emerald-300 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-2xs"
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
                    onClick={() => handleOpenEdit(q)}
                    className="h-9 inline-flex items-center justify-center gap-1.5 px-3 text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 border border-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    title="Edit Quotation"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Quote</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(q.id, q.quotationNumber)}
                    className="h-9 inline-flex items-center justify-center gap-1.5 px-3 text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-98 border border-rose-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    title="Delete Quotation"
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

      {/* ==================== CREATE / EDIT QUOTATION MODAL ==================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingQuoteId ? `Edit Quotation: ${quotationNumber}` : 'Create Formal Quotation'}
        size="lg"
      >
        <form onSubmit={handleSaveQuotation} className="space-y-4 text-xs">
          {/* Top Meta Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <Input
              label="Quotation Number *"
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              required
            />
            <Input
              label="Quotation Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Recipient Details (Email removed) */}
          <div className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#DFC9AE] space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-[#1A1D20] text-xs">
              <Building className="w-3.5 h-3.5 text-[#9E7B4F]" />
              <span>To (Client / Recipient Address)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Client / Attention Title *"
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
              label="Contact Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="98405 46766"
            />
          </div>

          {/* Subject & Letter Body */}
          <div className="space-y-3">
            <Input
              label="Subject Line *"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sub: Shifting of OFFICE FURNITURE'S FROM AMMA MALIGAI CHENNAI CENTRAL TO CMWSSB HEAD OFFICE..."
              required
            />

            <Textarea
              label="Opening Discussion Paragraph *"
              rows={3}
              value={introParagraph}
              onChange={(e) => setIntroParagraph(e.target.value)}
              required
            />
          </div>

          {/* Particulars Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Particulars & Rate Table</span>
              <button
                type="button"
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      service: 'EXTRA LABOUR AND PACKING MATERIALS CHARGES',
                      description: '',
                      qty: 1,
                      unitPrice: 3000,
                      discount: 0,
                      amount: 3000,
                    },
                  ])
                }
                className="text-xs font-bold text-[#9E7B4F] hover:text-[#8A6A3E] flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Particulars Line</span>
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Textarea
                      label={`Particulars (Row ${idx + 1})`}
                      rows={2}
                      value={item.service}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].service = e.target.value;
                        setItems(updated);
                      }}
                      placeholder="PACKING CHARGES, PACKING MATERIALS, TRANSPORT, LOADING CHARGES AND UNLOADING CHARGES."
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
                      label="Rate / Amount (Rs.) *"
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

          {/* Terms and Conditions List */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900">TERMS & CONDITIONS (5-Point Standard List)</span>
            {termsList.map((term, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[#9E7B4F] font-bold">➤</span>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const updated = [...termsList];
                    updated[idx] = e.target.value;
                    setTermsList(updated);
                  }}
                  className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9E7B4F]"
                />
              </div>
            ))}
          </div>

          {/* Total Bar */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl flex justify-between items-center text-sm font-extrabold">
            <span>TOTAL ESTIMATED QUOTATION RATE:</span>
            <span className="text-base text-amber-400">{formatRupeeDoc(calculateTotal())}</span>
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
              {editingQuoteId ? 'Save Changes' : 'Store Quotation in Firestore'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================== EXACT PHYSICAL QUOTATION PREVIEW MODAL ==================== */}
      {selectedQuote && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Quotation Preview: ${selectedQuote.quotationNumber}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Actions Bar */}
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
                onClick={() => generateQuotationPDF(selectedQuote, undefined, settings)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="bg-[#9E7B4F] hover:bg-[#8A6A3E] text-white"
              >
                Download PDF
              </Button>
            </div>

            {/* Paper Document Preview */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-md font-sans text-slate-900 space-y-6 max-w-2xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      settings.logoUrl && settings.logoUrl.startsWith('data:')
                        ? settings.logoUrl
                        : MKM_LOGO_BASE64
                    }
                    alt="MKM Logo"
                    className="w-12 h-12 rounded-full object-contain ring-1 ring-[#9E7B4F] bg-white p-0.5"
                  />
                  <div>
                    <h1 className="text-base font-black tracking-wide">
                      <span className="text-rose-600">MKM</span> PACKERS AND MOVERS
                    </h1>
                  </div>
                </div>

                <div className="text-right text-[10px] font-normal text-slate-800 leading-tight">
                  NO. 13/6, VALLALAR STREET, PADMANABA NAGAR,<br />
                  CHOOLAIMEDU, CHENNAI- 600 094.
                </div>
              </div>

              {/* Recipient & Date */}
              <div className="flex justify-between items-start pt-2">
                <div className="text-xs text-slate-900 leading-relaxed">
                  <p className="font-normal mb-1">To</p>
                  <p className="font-bold">
                    {selectedQuote.customerName || 'The Executive Engineer'}
                  </p>
                  <p className="font-normal">AOBM</p>
                  <p className="font-normal whitespace-pre-line">
                    {selectedQuote.dropAddress || 'Chennai Metropolitan Water Supply\nChennai 600028.'}
                  </p>
                </div>

                <div className="text-right font-bold text-xs text-slate-900">
                  DATE: {formatQuotationDate(selectedQuote.date)}
                </div>
              </div>

              {/* Underlined Subject */}
              <div className="text-xs text-slate-900 border-b border-slate-900 pb-1 font-normal leading-relaxed">
                {selectedQuote.subject ||
                  "Sub: Shifting of OFFICE FURNITURE'S FROM AMMA MALIGAI CHENNAI CENTRAL TO CMWSSB HEAD OFFICE, CHINTADRIPET, Chennai."}
              </div>

              {/* Introductory Paragraph */}
              <div className="text-xs text-slate-800 leading-relaxed font-normal">
                {selectedQuote.introParagraph ||
                  'Kindly refer to our discussion regarding the above subject. We are giving below here with our quotation and other terms and conditions. Hope you will find our quotation competitive and we assure for the best service. The scope of work would be packing and moving goods'}
              </div>

              {/* PARTICULARS TABLE */}
              <div className="border border-slate-900 overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-900">
                      <th className="px-2 py-1.5 text-center border-r border-slate-900 w-12 font-normal">
                        s.<br />no
                      </th>
                      <th className="px-3 py-1.5 text-center border-r border-slate-900 font-normal">
                        PARTICULARS
                      </th>
                      <th className="px-3 py-1.5 text-center w-32 font-normal">RATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuote.items && selectedQuote.items.length > 0 ? (
                      selectedQuote.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-900">
                          <td className="px-2 py-3 text-center border-r border-slate-900 font-normal">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-3 text-slate-900 border-r border-slate-900 font-normal uppercase">
                            {item.service}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-slate-900 underline">
                            {formatRupeeDoc(item.amount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-slate-900">
                        <td className="px-2 py-3 text-center border-r border-slate-900">1</td>
                        <td className="px-3 py-3 text-slate-900 border-r border-slate-900 uppercase">
                          PACKING CHARGES, PACKING MATERIALS, TRANSPORT, LOADING CHARGES AND UNLOADING CHARGES.
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-slate-900 underline">
                          {formatRupeeDoc(selectedQuote.grandTotal)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TERMS & CONDITIONS */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs text-slate-900 underline">TERMS & CONDITIONS</h3>
                <ul className="text-xs text-slate-800 space-y-1.5 pl-1 font-normal">
                  {(selectedQuote.termsList && selectedQuote.termsList.length > 0
                    ? selectedQuote.termsList
                    : defaultTermsList
                  ).map((term, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-slate-700">➤</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sign-off */}
              <div className="pt-4 text-xs text-slate-900 space-y-8">
                <p>For MKM PACKERS AND MOVERS</p>
                <p>Authorized signature</p>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-700">
                EMAIL: {settings.email || 'mkmpackersandmovers@gmail.com'}, CONACT:{' '}
                {settings.phone || '9840546766, 9342306048.'}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
