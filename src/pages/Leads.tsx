import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Phone,
  PhoneCall,
  MessageCircle,
  MapPin,
  Calendar,
  Trash2,
  ArrowRight,
  CheckCircle2,
  User,
  Building,
  RotateCcw,
  Sparkles,
  Eye,
  FileText,
  Truck,
  LayoutGrid,
  List,
  Edit3,
  Check,
  Send,
  Users,
} from 'lucide-react';
import { Lead, PropertyType, LeadSource, LeadStatus } from '../types';

export const Leads = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { leads, customers, addLead, updateLead, deleteLead, addCustomer, addQuotation, addBooking, settings } =
    useAppContext();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form State
  const [leadCustomerType, setLeadCustomerType] = useState<'existing' | 'new'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  const [movingDate, setMovingDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('2 BHK');
  const [source, setSource] = useState<LeadSource>('WhatsApp');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [estimatedValue, setEstimatedValue] = useState('14500');
  const [notes, setNotes] = useState('');

  const getCustomer = (id: string) => customers.find((c) => c.id === id);
  const getCustomerName = (id: string) => getCustomer(id)?.name || 'Customer';
  const getCustomerPhone = (id: string) => getCustomer(id)?.phone || '';

  const getStatusBadge = (lStatus: LeadStatus) => {
    switch (lStatus) {
      case 'New':
        return { variant: 'info' as const, label: 'New Enquiry' };
      case 'Contacted':
        return { variant: 'warning' as const, label: 'Contacted' };
      case 'Follow-up':
        return { variant: 'accent' as const, label: 'Follow-up' };
      case 'Quotation Sent':
        return { variant: 'neutral' as const, label: 'Quote Sent' };
      case 'Confirmed':
        return { variant: 'success' as const, label: 'Confirmed' };
      case 'Lost':
        return { variant: 'danger' as const, label: 'Lost' };
      default:
        return { variant: 'neutral' as const, label: lStatus };
    }
  };

  const handlePropertyTypeChange = (prop: PropertyType) => {
    setPropertyType(prop);
    const suggestedPrices: Record<PropertyType, string> = {
      '1 BHK': '8500',
      '2 BHK': '14500',
      '3 BHK': '22000',
      '4 BHK': '32000',
      'Villa': '45000',
      'Office': '28000',
      'Other': '6500',
    };
    if (suggestedPrices[prop]) {
      setEstimatedValue(suggestedPrices[prop]);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingLeadId(null);
    setLeadCustomerType('new');
    setNewCustomerName('');
    setNewCustomerPhone('');
    if (customers.length > 0) setSelectedCustomerId(customers[0].id);
    setMovingDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
    setPickupLocation('');
    setDropLocation('');
    setPropertyType('2 BHK');
    setSource('WhatsApp');
    setStatus('New');
    setEstimatedValue('14500');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setEditingLeadId(lead.id);
    const cust = getCustomer(lead.customerId);
    setLeadCustomerType('existing');
    setSelectedCustomerId(lead.customerId);
    setNewCustomerName(cust?.name || '');
    setNewCustomerPhone(cust?.phone || '');
    setMovingDate(lead.movingDate);
    setPickupLocation(lead.pickupLocation);
    setDropLocation(lead.dropLocation);
    setPropertyType(lead.propertyType);
    setSource(lead.source);
    setStatus(lead.status);
    setEstimatedValue(lead.estimatedValue.toString());
    setNotes(lead.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetCustomerId = selectedCustomerId;

    try {
      if (leadCustomerType === 'new') {
        if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
          toastError('Missing Details', 'Please provide customer name and phone number.');
          return;
        }

        const existingCust = customers.find((c) => c.phone.replace(/[^0-9]/g, '') === newCustomerPhone.replace(/[^0-9]/g, ''));
        if (existingCust) {
          targetCustomerId = existingCust.id;
        } else {
          targetCustomerId = `cust-${Date.now()}`;
          await addCustomer({
            id: targetCustomerId,
            name: newCustomerName.trim(),
            phone: newCustomerPhone.trim(),
            whatsapp: newCustomerPhone.trim(),
            email: '',
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (!pickupLocation.trim() || !dropLocation.trim()) {
        toastError('Missing Locations', 'Please enter pickup and drop addresses.');
        return;
      }

      if (editingLeadId) {
        const existing = leads.find((l) => l.id === editingLeadId);
        const updated: Lead = {
          id: editingLeadId,
          customerId: targetCustomerId,
          movingDate,
          pickupLocation: pickupLocation.trim(),
          dropLocation: dropLocation.trim(),
          propertyType,
          floorNumber: '1st Floor',
          liftAvailable: true,
          parkingAvailable: true,
          packingRequired: true,
          loadingRequired: true,
          unloadingRequired: true,
          unpackingRequired: false,
          vehicleRequired: true,
          source,
          status,
          notes,
          estimatedValue: Number(estimatedValue) || 10000,
          createdAt: existing?.createdAt || new Date().toISOString(),
        };
        await updateLead(updated);
        success('Lead Updated', 'Enquiry details have been updated.');
      } else {
        const newLead: Lead = {
          id: `lead-${Date.now()}`,
          customerId: targetCustomerId,
          movingDate,
          pickupLocation: pickupLocation.trim(),
          dropLocation: dropLocation.trim(),
          propertyType,
          floorNumber: '1st Floor',
          liftAvailable: true,
          parkingAvailable: true,
          packingRequired: true,
          loadingRequired: true,
          unloadingRequired: true,
          unpackingRequired: false,
          vehicleRequired: true,
          source,
          status,
          notes,
          estimatedValue: Number(estimatedValue) || 10000,
          createdAt: new Date().toISOString(),
        };
        await addLead(newLead);
        success('Lead Added', 'New customer enquiry has been recorded.');
      }

      setIsAddModalOpen(false);
    } catch (err: any) {
      toastError('Unable to Save Lead', err?.message || 'Unable to save. Please check your connection and try again.');
    }
  };

  const handleUpdateStatus = (lead: Lead, newStatus: LeadStatus) => {
    const updated = { ...lead, status: newStatus };
    updateLead(updated);
    if (selectedLead?.id === lead.id) setSelectedLead(updated);
    success('Status Updated', `Enquiry marked as ${newStatus}.`);
  };

  const handleConvertToQuotation = (lead: Lead) => {
    const quoteNum = `${settings.quotationPrefix}${Date.now().toString().slice(-4)}`;
    const estVal = lead.estimatedValue || 12000;

    addQuotation({
      id: `quote-${Date.now()}`,
      quotationNumber: quoteNum,
      customerId: lead.customerId,
      leadId: lead.id,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      movingDate: lead.movingDate,
      pickupAddress: lead.pickupLocation,
      dropAddress: lead.dropLocation,
      propertyType: lead.propertyType,
      floor: '1st',
      lift: true,
      parking: true,
      distance: 'Direct Move',
      vehicleType: '14ft Closed Container',
      items: [
        {
          id: '1',
          service: 'Relocation & Transportation Charges',
          description: `${lead.pickupLocation} to ${lead.dropLocation}`,
          qty: 1,
          unitPrice: Math.round(estVal * 0.65),
          discount: 0,
          amount: Math.round(estVal * 0.65),
        },
        {
          id: '2',
          service: 'Handling, Loading & Labour Charges',
          description: 'Professional moving crew',
          qty: 1,
          unitPrice: Math.round(estVal * 0.2),
          discount: 0,
          amount: Math.round(estVal * 0.2),
        },
        {
          id: '3',
          service: 'Packing Materials & Protection',
          description: 'Bubble wrapping and cartons',
          qty: 1,
          unitPrice: Math.round(estVal * 0.15),
          discount: 0,
          amount: Math.round(estVal * 0.15),
        },
      ],
      subtotal: estVal,
      discount: 0,
      tax: 0,
      grandTotal: estVal,
      notes: lead.notes,
      status: 'Sent',
      createdAt: new Date().toISOString(),
    });

    updateLead({ ...lead, status: 'Quotation Sent' });
    success('Quotation Generated', `Quotation ${quoteNum} created from enquiry.`);
    setIsDetailsModalOpen(false);
    navigate('/quotations');
  };

  const handleConvertToBooking = (lead: Lead) => {
    const bookingNum = `BKG-${Date.now().toString().slice(-4)}`;
    const total = lead.estimatedValue || 14000;
    const advance = Math.round(total * 0.25);

    addBooking({
      id: `bkg-${Date.now()}`,
      bookingNumber: bookingNum,
      customerId: lead.customerId,
      movingDate: lead.movingDate,
      pickupLocation: lead.pickupLocation,
      dropLocation: lead.dropLocation,
      vehicle: '14ft Closed Container',
      driver: 'To be assigned',
      workers: 3,
      status: 'Confirmed',
      totalAmount: total,
      advanceAmount: advance,
      balanceAmount: total - advance,
      notes: lead.notes,
      createdAt: new Date().toISOString(),
    });

    updateLead({ ...lead, status: 'Confirmed' });
    success('Booking Confirmed', `Order #${bookingNum} created from lead.`);
    setIsDetailsModalOpen(false);
    navigate('/bookings');
  };

  const handleShareWhatsApp = (lead: Lead) => {
    const cust = getCustomer(lead.customerId);
    const phone = (cust?.whatsapp || cust?.phone || '').replace(/[^0-9]/g, '');
    const text = `*HELLO FROM ${settings.companyName.toUpperCase()}*\n\nDear ${cust?.name},\nThank you for reaching out regarding your relocation from *${lead.pickupLocation}* to *${lead.dropLocation}* on *${formatDate(lead.movingDate)}*.\n\nOur team is reviewing your requirement and will provide the best competitive quotation shortly.\n\n📞 Support Hotline: ${settings.phone}\n${settings.companyName}`;
    const finalPhone = phone.length === 10 ? '91' + phone : phone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      deleteLead(id);
      success('Lead Deleted', 'The enquiry was removed.');
      if (selectedLead?.id === id) setIsDetailsModalOpen(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const customer = customers.find((c) => c.id === lead.customerId);
    const matchesSearch =
      (customer?.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer?.phone && customer.phone.includes(searchTerm)) ||
      lead.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.dropLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const totalLeadsPipeline = leads.reduce((sum, l) => sum + l.estimatedValue, 0);
  const newLeadsCount = leads.filter((l) => l.status === 'New').length;
  const confirmedLeadsCount = leads.filter((l) => l.status === 'Confirmed').length;

  return (
    <div className="space-y-4">
      {/* ULTRA SLIM MINI STATS BAR */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Total Enquiries:</span>
          <span className="font-extrabold text-slate-900">{leads.length}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">New Leads:</span>
          <span className="font-extrabold text-sky-700">{newLeadsCount}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Converted:</span>
          <span className="font-extrabold text-emerald-700">{confirmedLeadsCount}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Pipeline:</span>
          <span className="font-extrabold text-amber-900">{formatCurrency(totalLeadsPipeline)}</span>
        </div>
      </div>

      {/* Header Search & Actions */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="leads-search-input"
              type="text"
              placeholder="Search by customer, phone, pickup, drop..."
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
              id="btn-add-lead-modal"
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
              className="font-bold shrink-0"
            >
              Add Enquiry
            </Button>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {[
            { id: 'ALL', label: `All (${leads.length})` },
            { id: 'New', label: `New (${leads.filter((l) => l.status === 'New').length})` },
            { id: 'Contacted', label: `Contacted (${leads.filter((l) => l.status === 'Contacted').length})` },
            { id: 'Follow-up', label: `Follow-up (${leads.filter((l) => l.status === 'Follow-up').length})` },
            { id: 'Confirmed', label: `Confirmed (${leads.filter((l) => l.status === 'Confirmed').length})` },
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
      {filteredLeads.length === 0 ? (
        <Card>
          <EmptyState
            icon={<User className="w-8 h-8 text-slate-400" />}
            title="No leads or enquiries found"
            description="Capture customer relocation requests from WhatsApp, Google, and website forms."
            actionLabel="Add Lead"
            onAction={handleOpenCreateModal}
            actionIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
          />
        </Card>
      ) : viewMode === 'grid' ? (
        /* ==================== CARD GRID VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredLeads.map((lead) => {
            const cust = getCustomer(lead.customerId);
            const statusInfo = getStatusBadge(lead.status);
            const cleanPhone = cust?.phone.replace(/[^0-9]/g, '') || '';

            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-150 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-900 text-sm block truncate">
                        {cust?.name || 'Customer'}
                      </span>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Move: {formatDate(lead.movingDate)}</span>
                      </p>
                    </div>

                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead, e.target.value as LeadStatus)}
                      className="text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 focus:outline-none cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Quotation Sent">Quote Sent</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>

                  {/* Customer Information & Quick Call */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-600 font-bold">{cust?.phone}</p>
                      <p className="text-[10px] text-slate-400">Source: {lead.source}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {cleanPhone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          title="Call Lead"
                          className="w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(lead)}
                        title="Send WhatsApp Message"
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Shifting Route */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{lead.pickupLocation.split(',')[0]}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{lead.dropLocation.split(',')[0]}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate pl-5">
                      {lead.propertyType} • Est: {formatCurrency(lead.estimatedValue)}
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="bg-slate-50/80 p-2.5 border-t border-slate-100 space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleConvertToQuotation(lead)}
                      className="h-8 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Send Quote</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConvertToBooking(lead)}
                      className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Book Move</span>
                    </button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/50">
                    <button
                      onClick={() => handleOpenEditModal(lead)}
                      className="py-0.5 px-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsDetailsModalOpen(true);
                      }}
                      className="py-0.5 px-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => handleDeleteLead(lead.id)}
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
                <TableHead>Customer</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Move Date</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Est. Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => {
                const cust = getCustomer(lead.customerId);
                const statusInfo = getStatusBadge(lead.status);

                return (
                  <TableRow
                    key={lead.id}
                    isClickable
                    onClick={() => {
                      setSelectedLead(lead);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900 truncate">{cust?.name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-500">{cust?.phone}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="font-bold text-slate-800 text-xs truncate">
                        {lead.pickupLocation.split(',')[0]} ➔ {lead.dropLocation.split(',')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{lead.pickupLocation}</p>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-slate-700 whitespace-nowrap text-xs">
                        {formatDate(lead.movingDate)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700">{lead.propertyType}</span>
                    </TableCell>

                    <TableCell>
                      <span className="font-black text-slate-900 whitespace-nowrap">
                        {formatCurrency(lead.estimatedValue)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant={statusInfo.variant} dot>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(lead)}
                          title="Edit Lead"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(lead)}
                          title="WhatsApp Inquiry"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleConvertToQuotation(lead)}
                          title="Send Quotation"
                          className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleConvertToBooking(lead)}
                          title="Convert to Move"
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

      {/* Create / Edit Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingLeadId ? 'Edit Relocation Enquiry' : 'Add Relocation Enquiry'}
        subtitle="Capture moving lead details, route, property size, and estimated value"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveLead} className="space-y-3.5 text-xs">
          {/* Customer Selection / New Customer */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Customer Information
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="custType"
                    checked={leadCustomerType === 'new'}
                    onChange={() => setLeadCustomerType('new')}
                    className="accent-indigo-600"
                  />
                  <span>New Customer</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="custType"
                    checked={leadCustomerType === 'existing'}
                    onChange={() => setLeadCustomerType('existing')}
                    className="accent-indigo-600"
                  />
                  <span>Existing</span>
                </label>
              </div>
            </div>

            {leadCustomerType === 'new' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  label="Customer Name *"
                  placeholder="e.g. Anand Kumar"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  required
                />
                <Input
                  label="Mobile Number *"
                  placeholder="e.g. 9884834664"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  required
                />
              </div>
            ) : (
              <Select
                label="Select Existing Customer *"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                options={customers.map((c) => ({
                  label: `${c.name} (${c.phone})`,
                  value: c.id,
                }))}
              />
            )}
          </div>

          {/* Move Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Moving Date *"
              type="date"
              value={movingDate}
              onChange={(e) => setMovingDate(e.target.value)}
              required
            />
            <Select
              label="Property Size"
              value={propertyType}
              onChange={(e) => handlePropertyTypeChange(e.target.value as PropertyType)}
              options={[
                { label: '1 BHK Apartment', value: '1 BHK' },
                { label: '2 BHK Apartment', value: '2 BHK' },
                { label: '3 BHK Apartment', value: '3 BHK' },
                { label: '4 BHK / Villa', value: '4 BHK' },
                { label: 'Independent Villa', value: 'Villa' },
                { label: 'Commercial Office', value: 'Office' },
              ]}
            />
            <Input
              label="Pickup Location (Origin) *"
              placeholder="e.g. West Mambalam, Chennai"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
            />
            <Input
              label="Drop Location (Destination) *"
              placeholder="e.g. Senthamizh Nagar, Sivagangai"
              value={dropLocation}
              onChange={(e) => setDropLocation(e.target.value)}
              required
            />
            <Input
              label="Estimated Value (₹) *"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              required
            />
            <Select
              label="Lead Source"
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
              options={[
                { label: 'WhatsApp Enquiry', value: 'WhatsApp' },
                { label: 'Google Search / Maps', value: 'Google' },
                { label: 'Direct Phone Call', value: 'Website' },
                { label: 'Referral / Recommendation', value: 'Referral' },
                { label: 'Instagram / Facebook', value: 'Instagram' },
              ]}
            />
          </div>

          <Textarea
            label="Notes / Customer Inventory Remarks"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Fridge, Washing Machine, 2 Cots, 15 boxes..."
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingLeadId ? 'Save Enquiry' : 'Save Enquiry'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Lead Details Modal */}
      {selectedLead && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Relocation Lead Details"
          subtitle={`Enquiry for ${getCustomerName(selectedLead.customerId)}`}
          maxWidth="2xl"
          footer={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteLead(selectedLead.id)}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                className="text-rose-600 hover:bg-rose-50"
              >
                Delete
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareWhatsApp(selectedLead)}
                  leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConvertToQuotation(selectedLead)}
                  leftIcon={<FileText className="w-3.5 h-3.5 text-indigo-600" />}
                >
                  Create Quotation
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleConvertToBooking(selectedLead)}
                  leftIcon={<Truck className="w-3.5 h-3.5" />}
                >
                  Confirm Move
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            {/* Customer Strip */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Customer Name</span>
                <p className="font-extrabold text-sm text-slate-900">{getCustomerName(selectedLead.customerId)}</p>
                <p className="text-slate-600">{getCustomerPhone(selectedLead.customerId)}</p>
              </div>
              <div className="text-right">
                <Badge variant={getStatusBadge(selectedLead.status).variant} dot>
                  {selectedLead.status}
                </Badge>
                <p className="text-xs font-black text-slate-900 mt-1">
                  Est: {formatCurrency(selectedLead.estimatedValue)}
                </p>
              </div>
            </div>

            {/* Route */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Moving Schedule & Route
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Pickup Location</span>
                  <p className="font-semibold text-slate-800">{selectedLead.pickupLocation}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Drop Location</span>
                  <p className="font-semibold text-slate-800">{selectedLead.dropLocation}</p>
                </div>
              </div>
              <p className="text-slate-600 font-medium">
                Moving Date: <span className="font-bold text-slate-900">{formatDate(selectedLead.movingDate)}</span> • Property: {selectedLead.propertyType}
              </p>
            </div>

            {selectedLead.notes && (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Inventory Notes</span>
                <p className="text-slate-700 text-xs mt-0.5">{selectedLead.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
