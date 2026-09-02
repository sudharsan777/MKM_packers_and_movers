import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Printer,
  Trash2,
  PlusCircle,
  CheckCircle2,
  Truck,
  MessageCircle,
  Eye,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  List,
  Edit3,
  Phone,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';
import { Quotation, QuotationItem, PropertyType } from '../types';
import { generateQuotationPDF } from '../utils/pdfExport';

export const Quotations = () => {
  const navigate = useNavigate();
  const {
    quotations,
    customers,
    servicePrices,
    settings,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    generateNextQuotationNumber,
    addBooking,
  } = useAppContext();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');
  const [movingDate, setMovingDate] = useState(
    new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('2 BHK');
  const [floor, setFloor] = useState('Ground Floor');
  const [vehicleType, setVehicleType] = useState('14ft Closed Container Truck');
  const [notes, setNotes] = useState('Includes dedicated closed truck, bubble packaging, and trained handling crew.');

  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: '1',
      service: 'Transportation & Dedicated Freight Charges',
      description: 'Dedicated closed container vehicle with door-to-door transit',
      qty: 1,
      unitPrice: 12000,
      discount: 0,
      amount: 12000,
    },
    {
      id: '2',
      service: 'Handling, Loading & Labour Charges',
      description: 'Trained professional handlers for safe loading & unloading',
      qty: 1,
      unitPrice: 3500,
      discount: 0,
      amount: 3500,
    },
    {
      id: '3',
      service: 'Packing Materials & Professional Packing',
      description: 'Standard household bubble wrapping, stretch film & boxes',
      qty: 1,
      unitPrice: 2500,
      discount: 0,
      amount: 2500,
    },
  ]);

  const [discountAmount, setDiscountAmount] = useState('0');
  const [includeTax, setIncludeTax] = useState(false);

  const getCustomer = (id: string) => customers.find((c) => c.id === id);
  const getCustomerName = (q: Quotation) => {
    const cust = getCustomer(q.customerId);
    return cust?.name || 'Customer';
  };
  const getCustomerPhone = (q: Quotation) => {
    const cust = getCustomer(q.customerId);
    return cust?.phone || '';
  };

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
  const handleAddPresetItem = (serviceName: string, defaultRate: number, defaultDesc: string) => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        service: serviceName,
        description: defaultDesc,
        qty: 1,
        unitPrice: defaultRate,
        discount: 0,
        amount: defaultRate,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toastError('Cannot Remove', 'Quotation must have at least one line item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = calculateSubtotal(items);
  const discountVal = Number(discountAmount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountVal);
  const tax = includeTax ? Math.round(taxableAmount * (settings.taxRate / 100)) : 0;
  const grandTotal = taxableAmount + tax;

  const handleOpenCreateModal = () => {
    setEditingQuoteId(null);
    if (customers.length > 0) setCustomerId(customers[0].id);
    setMovingDate(new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]);
    setValidUntil(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
    setPickupAddress('');
    setDropAddress('');
    setPropertyType('2 BHK');
    setFloor('Ground Floor');
    setVehicleType('14ft Closed Container Truck');
    setNotes('Includes dedicated closed truck, bubble packaging, and trained handling crew.');
    setItems([
      {
        id: '1',
        service: 'Transportation & Dedicated Freight Charges',
        description: 'Dedicated closed container vehicle with door-to-door transit',
        qty: 1,
        unitPrice: 12000,
        discount: 0,
        amount: 12000,
      },
      {
        id: '2',
        service: 'Handling, Loading & Labour Charges',
        description: 'Trained professional handlers for safe loading & unloading',
        qty: 1,
        unitPrice: 3500,
        discount: 0,
        amount: 3500,
      },
      {
        id: '3',
        service: 'Packing Materials & Professional Packing',
        description: 'Standard household bubble wrapping, stretch film & boxes',
        qty: 1,
        unitPrice: 2500,
        discount: 0,
        amount: 2500,
      },
    ]);
    setDiscountAmount('0');
    setIncludeTax(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (q: Quotation) => {
    setEditingQuoteId(q.id);
    setCustomerId(q.customerId);
    setMovingDate(q.movingDate);
    setValidUntil(q.validUntil);
    setPickupAddress(q.pickupAddress);
    setDropAddress(q.dropAddress);
    setPropertyType(q.propertyType || '2 BHK');
    setFloor(q.floor || 'Ground Floor');
    setVehicleType(q.vehicleType || '14ft Closed Container Truck');
    setNotes(q.notes || '');
    setItems(q.items.length > 0 ? q.items : [
      {
        id: '1',
        service: 'Relocation & Handling Charges',
        description: 'Door-to-door relocation estimate',
        qty: 1,
        unitPrice: q.grandTotal,
        discount: 0,
        amount: q.grandTotal,
      },
    ]);
    setDiscountAmount(q.discount.toString());
    setIncludeTax(q.tax > 0);
    setIsAddModalOpen(true);
  };

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress.trim() || !dropAddress.trim()) {
      toastError('Missing Fields', 'Please enter pickup and drop addresses.');
      return;
    }

    try {
      if (editingQuoteId) {
        const existing = quotations.find((q) => q.id === editingQuoteId);
        const updated: Quotation = {
          id: editingQuoteId,
          quotationNumber: existing?.quotationNumber || `QUO-${Date.now().toString().slice(-4)}`,
          customerId,
          date: existing?.date || new Date().toISOString().split('T')[0],
          validUntil,
          movingDate,
          pickupAddress: pickupAddress.trim(),
          dropAddress: dropAddress.trim(),
          propertyType,
          floor,
          lift: true,
          parking: true,
          distance: 'Direct Move',
          vehicleType,
          items,
          subtotal,
          discount: discountVal,
          tax,
          grandTotal,
          notes,
          status: existing?.status || 'Sent',
          createdAt: existing?.createdAt || new Date().toISOString(),
        };
        await updateQuotation(updated);
        success('Quotation Updated', `Quotation ${updated.quotationNumber} updated.`);
      } else {
        let newQuoteNum = `${settings.quotationPrefix || 'QT-'}${Date.now().toString().slice(-4)}`;
        try {
          newQuoteNum = await generateNextQuotationNumber();
        } catch (e) {
          console.warn('Fallback numbering for quotation:', e);
        }

        const newQuotation: Quotation = {
          id: `quote-${Date.now()}`,
          quotationNumber: newQuoteNum,
          customerId,
          date: new Date().toISOString().split('T')[0],
          validUntil,
          movingDate,
          pickupAddress: pickupAddress.trim(),
          dropAddress: dropAddress.trim(),
          propertyType,
          floor,
          lift: true,
          parking: true,
          distance: 'Direct Move',
          vehicleType,
          items,
          subtotal,
          discount: discountVal,
          tax,
          grandTotal,
          notes,
          status: 'Sent',
          createdAt: new Date().toISOString(),
        };
        await addQuotation(newQuotation);
        success('Quotation Created', `Quotation ${newQuoteNum} generated.`);
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      toastError('Unable to Save Quotation', err?.message || 'Unable to save. Please check your connection and try again.');
    }
  };

  const handleUpdateStatus = (q: Quotation, newStatus: Quotation['status']) => {
    const updated = { ...q, status: newStatus };
    updateQuotation(updated);
    if (selectedQuote?.id === q.id) setSelectedQuote(updated);
    success('Status Updated', `Quotation #${q.quotationNumber} marked as ${newStatus}.`);
  };

  const handleConvertToBooking = (quote: Quotation) => {
    const bookingNum = `BKG-${Date.now().toString().slice(-4)}`;
    const advance = Math.round(quote.grandTotal * 0.25);
    const balance = quote.grandTotal - advance;

    addBooking({
      id: `bkg-${Date.now()}`,
      bookingNumber: bookingNum,
      customerId: quote.customerId,
      quotationId: quote.id,
      movingDate: quote.movingDate,
      pickupLocation: quote.pickupAddress,
      dropLocation: quote.dropAddress,
      vehicle: quote.vehicleType,
      driver: 'To be assigned',
      workers: 3,
      status: 'Confirmed',
      totalAmount: quote.grandTotal,
      advanceAmount: advance,
      balanceAmount: balance,
      notes: `Generated from Quotation ${quote.quotationNumber}. ${quote.notes}`,
      createdAt: new Date().toISOString(),
    });

    updateQuotation({ ...quote, status: 'Accepted' });
    success('Order Created', `Booking order #${bookingNum} created from quotation.`);
    setIsPreviewModalOpen(false);
    navigate('/bookings');
  };

  const handleDownloadPDF = (quote: Quotation) => {
    const customer = getCustomer(quote.customerId);
    generateQuotationPDF(quote, customer, settings);
    const custName = (customer?.name || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
    success('PDF Downloaded', `${custName}-${quote.quotationNumber}.pdf downloaded.`);
  };

  const handleShareWhatsApp = (quote: Quotation) => {
    const customer = getCustomer(quote.customerId);
    const phone = (customer?.whatsapp || customer?.phone || '').replace(/[^0-9]/g, '');
    const text = `*RELOCATION QUOTATION — ${settings.companyName.toUpperCase()}*\n\nDear ${customer?.name},\nHere is your shifting estimate *#${quote.quotationNumber}*:\n\n📅 *Moving Date:* ${formatDate(quote.movingDate)}\n📍 *Pickup:* ${quote.pickupAddress}\n📍 *Drop:* ${quote.dropAddress}\n🏠 *Property:* ${quote.propertyType}\n🚛 *Vehicle:* ${quote.vehicleType}\n\n💰 *Total Estimate: ${formatCurrency(quote.grandTotal)}*\n📅 *Valid Until:* ${formatDate(quote.validUntil)}\n\nReply to confirm your truck booking slot!\n\n📞 ${settings.phone}\n${settings.companyName}`;
    const finalPhone = phone.length === 10 ? '91' + phone : phone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDeleteQuotation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteQuotation(id);
      success('Quotation Deleted', 'The quotation has been removed.');
      if (selectedQuote?.id === id) setIsPreviewModalOpen(false);
    }
  };

  const filteredQuotes = quotations.filter((q) => {
    const cust = getCustomer(q.customerId);
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust?.name && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cust?.phone && cust.phone.includes(searchTerm)) ||
      q.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.dropAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalQuotesValue = quotations.reduce((sum, q) => sum + q.grandTotal, 0);
  const acceptedQuotesCount = quotations.filter((q) => q.status === 'Accepted').length;

  return (
    <div className="space-y-4">
      {/* ULTRA SLIM MINI STATS BAR */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Total Quotes:</span>
          <span className="font-extrabold text-slate-900">{quotations.length}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Accepted Deals:</span>
          <span className="font-extrabold text-emerald-700">{acceptedQuotesCount}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Pipeline Value:</span>
          <span className="font-extrabold text-amber-900">{formatCurrency(totalQuotesValue)}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
          <span>Pending:</span>
          <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full">
            {quotations.filter((q) => q.status === 'Sent' || q.status === 'Draft').length}
          </span>
        </div>
      </div>

      {/* Header Search & Actions */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="quotations-search-input"
              type="text"
              placeholder="Search by quote #, customer, route..."
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
              id="btn-add-quotation-modal"
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
              className="font-bold shrink-0"
            >
              New Quotation
            </Button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {[
            { id: 'ALL', label: `All (${quotations.length})` },
            { id: 'Sent', label: `Sent (${quotations.filter((q) => q.status === 'Sent').length})` },
            { id: 'Accepted', label: `Accepted (${quotations.filter((q) => q.status === 'Accepted').length})` },
            { id: 'Draft', label: `Draft (${quotations.filter((q) => q.status === 'Draft').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-2.5 py-0.5 text-xs rounded-full font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Cards Grid or Table */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText className="w-8 h-8 text-slate-400" />}
            title="No quotations found"
            description="Create commercial moving estimates and convert accepted quotes to confirmed bookings."
            actionLabel="New Quotation"
            onAction={handleOpenCreateModal}
            actionIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
          />
        </Card>
      ) : viewMode === 'grid' ? (
        /* ==================== CARD GRID VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredQuotes.map((q) => {
            const customer = getCustomer(q.customerId);
            const cName = getCustomerName(q);
            const cPhone = getCustomerPhone(q);
            const cleanPhone = cPhone.replace(/[^0-9]/g, '');

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-150 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono font-black text-slate-900 text-sm block">
                        #{q.quotationNumber}
                      </span>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Date: {formatDate(q.date)}</span>
                      </p>
                    </div>

                    <select
                      value={q.status}
                      onChange={(e) => handleUpdateStatus(q, e.target.value as Quotation['status'])}
                      className="text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 focus:outline-none cursor-pointer"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Customer Information & Quick Call */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{cName}</p>
                      <p className="text-[11px] text-slate-600 font-medium">{cPhone}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {cleanPhone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          title="Call Customer"
                          className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(q)}
                        title="Send Quote on WhatsApp"
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Route & Property */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{q.pickupAddress.split(',')[0]}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{q.dropAddress.split(',')[0]}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate pl-5">
                      {q.propertyType} • Move: {formatDate(q.movingDate)}
                    </p>
                  </div>

                  {/* Pricing Total */}
                  <div className="flex justify-between items-center bg-indigo-50/70 p-2 rounded-xl border border-indigo-100 text-xs font-bold">
                    <span className="text-indigo-900">Total Estimate:</span>
                    <span className="text-sm font-black text-indigo-900">{formatCurrency(q.grandTotal)}</span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="bg-slate-50/80 p-2.5 border-t border-slate-100 space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadPDF(q)}
                      className="h-8 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConvertToBooking(q)}
                      className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Book Move</span>
                    </button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/50">
                    <button
                      onClick={() => handleOpenEditModal(q)}
                      className="py-0.5 px-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedQuote(q);
                        setIsPreviewModalOpen(true);
                      }}
                      className="py-0.5 px-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleDeleteQuotation(q.id)}
                      className="py-0.5 px-2 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors flex items-center gap-1 cursor-pointer"
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
        /* ==================== TABLE VIEW ==================== */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Moving Date</TableHead>
                <TableHead>Grand Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((q) => {
                const cName = getCustomerName(q);
                const cPhone = getCustomerPhone(q);

                return (
                  <TableRow
                    key={q.id}
                    isClickable
                    onClick={() => {
                      setSelectedQuote(q);
                      setIsPreviewModalOpen(true);
                    }}
                  >
                    <TableCell>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        #{q.quotationNumber}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900 truncate">{cName}</p>
                        <p className="text-[11px] text-slate-500">{cPhone}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="font-bold text-slate-800 text-xs truncate">
                        {q.pickupAddress.split(',')[0]} ➔ {q.dropAddress.split(',')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{q.propertyType}</p>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-slate-700 whitespace-nowrap text-xs">
                        {formatDate(q.movingDate)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-black text-slate-900 whitespace-nowrap">
                        {formatCurrency(q.grandTotal)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          q.status === 'Accepted'
                            ? 'success'
                            : q.status === 'Sent'
                            ? 'info'
                            : 'neutral'
                        }
                        dot
                      >
                        {q.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          title="Edit Quotation"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(q)}
                          title="Download PDF"
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(q)}
                          title="WhatsApp Quote"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleConvertToBooking(q)}
                          title="Convert to Confirmed Move"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
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

      {/* Create / Edit Quotation Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingQuoteId ? 'Edit Quotation' : 'Create Relocation Quotation'}
        subtitle="Custom estimate with handling & labour charges, packing, and vehicle freight"
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveQuotation} className="space-y-4 text-xs">
          {/* Section 1: Customer & Route */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
              1. Customer & Location Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Select
                label="Select Customer *"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                options={customers.map((c) => ({
                  label: `${c.name} (${c.phone})`,
                  value: c.id,
                }))}
              />

              <Input
                label="Moving Date *"
                type="date"
                value={movingDate}
                onChange={(e) => setMovingDate(e.target.value)}
                required
              />

              <Input
                label="Quote Valid Until *"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />

              <Input
                label="Pickup Address (Origin) *"
                placeholder="e.g. West Mambalam, Chennai"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
              />

              <Input
                label="Drop Address (Destination) *"
                placeholder="e.g. Senthamizh Nagar, Sivagangai"
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                required
              />

              <Select
                label="Property Type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                options={[
                  { label: '1 BHK Apartment', value: '1 BHK' },
                  { label: '2 BHK Apartment', value: '2 BHK' },
                  { label: '3 BHK Apartment', value: '3 BHK' },
                  { label: '4 BHK / Villa', value: '4 BHK' },
                  { label: 'Independent Villa', value: 'Villa' },
                  { label: 'Office Move', value: 'Office' },
                ]}
              />
            </div>
          </div>

          {/* Section 2: Line Items & Handling Charges */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Handling, Labour, Packing & Shifting Items</span>
              </span>

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
                      'Carton boxes & bubble wrapping'
                    )
                  }
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                >
                  + 📦 Packing
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddPresetItem('Custom Charge', 1500, 'Special handling service')
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
                        placeholder="Service Title (e.g. Transportation Freight Charges)"
                        className="w-full font-extrabold text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Details / Specifications"
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
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-28 sm:w-32 h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 text-right focus:border-indigo-600 focus:outline-none"
                        />
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

          {/* Section 3: Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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

            <div className="bg-slate-900 text-white p-3 rounded-xl space-y-1">
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
              <div className="pt-1 border-t border-slate-700 flex justify-between items-center text-sm font-black text-amber-400">
                <span>Estimated Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingQuoteId ? 'Save Quotation' : 'Create Quotation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Quotation Modal */}
      {selectedQuote && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Quotation #${selectedQuote.quotationNumber}`}
          subtitle={`Estimated for ${getCustomerName(selectedQuote)}`}
          maxWidth="3xl"
          footer={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteQuotation(selectedQuote.id)}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                className="text-rose-600 hover:bg-rose-50"
              >
                Delete
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPreviewModalOpen(false);
                    handleOpenEditModal(selectedQuote);
                  }}
                  leftIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-600" />}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(selectedQuote)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareWhatsApp(selectedQuote)}
                  leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleConvertToBooking(selectedQuote)}
                  leftIcon={<Truck className="w-3.5 h-3.5" />}
                >
                  Convert to Active Move
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-3.5 bg-white text-xs">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-indigo-900">{settings.companyName}</h3>
                <p className="text-slate-600 text-xs mt-0.5">{settings.address}</p>
                <p className="text-slate-500 text-[11px]">Phone: {settings.phone} • Email: {settings.email}</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full">
                  {selectedQuote.status}
                </span>
                <p className="font-mono font-black text-sm text-slate-900 mt-1">#{selectedQuote.quotationNumber}</p>
                <p className="text-slate-500 text-[11px]">Date: {formatDate(selectedQuote.date)}</p>
              </div>
            </div>

            {/* Customer & Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Customer Details</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{getCustomerName(selectedQuote)}</p>
                <p className="text-slate-600">{getCustomerPhone(selectedQuote)}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Moving Schedule</span>
                <p className="font-bold text-slate-900 mt-0.5">📅 {formatDate(selectedQuote.movingDate)}</p>
                <p className="text-slate-600">{selectedQuote.propertyType} • {selectedQuote.vehicleType}</p>
              </div>
            </div>

            {/* Locations */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase block">Origin (Pickup)</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedQuote.pickupAddress}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase block">Destination (Drop)</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedQuote.dropAddress}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Service Description</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Estimated Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedQuote.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
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

            {/* Total */}
            <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-xs font-bold">
              <span className="text-indigo-900">Grand Total Estimate:</span>
              <span className="text-base font-black text-indigo-900">{formatCurrency(selectedQuote.grandTotal)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
