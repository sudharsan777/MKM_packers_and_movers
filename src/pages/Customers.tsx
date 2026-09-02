import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Badge } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { useToast } from '../components/ui/Toast';
import { useAppContext } from '../store/AppContext';
import { formatDate, formatCurrency } from '../utils';
import {
  Search,
  Plus,
  Phone,
  PhoneCall,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Truck,
  Receipt,
  CreditCard,
  CheckCircle2,
  Users,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  LayoutGrid,
  List,
  Copy,
  Check,
  Send,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Customer } from '../types';

export const Customers = () => {
  const navigate = useNavigate();
  const { customers, leads, bookings, quotations, invoices, payments, addCustomer, updateCustomer, settings } =
    useAppContext();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE_MOVES' | 'PENDING_DUES' | 'RECENT'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'quotes' | 'bookings' | 'invoices' | 'payments'>('overview');

  // WhatsApp Quick Message Modal
  const [whatsAppModalCustomer, setWhatsAppModalCustomer] = useState<Customer | null>(null);
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('greeting');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Customer Form State (for Add & Edit)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  // Statistics calculation for a customer
  const getCustomerStats = (customerId: string) => {
    const custLeads = leads.filter((l) => l.customerId === customerId);
    const custQuotes = quotations.filter((q) => q.customerId === customerId);
    const custBookings = bookings.filter((b) => b.customerId === customerId);
    const custInvoices = invoices.filter((i) => i.customerId === customerId);
    const custPayments = payments.filter((p) => p.customerId === customerId);

    const totalInvoiced = custInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalPaid = custInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalOutstanding = custInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
    const activeMoves = custBookings.filter((b) => b.status !== 'Completed' && b.status !== 'Cancelled').length;

    return {
      leads: custLeads,
      quotes: custQuotes,
      bookings: custBookings,
      invoices: custInvoices,
      payments: custPayments,
      totalBookings: custBookings.length,
      activeMoves,
      totalInvoiced,
      totalPaid,
      totalOutstanding,
    };
  };

  // Filtered customers
  const filteredCustomers = customers.filter((customer) => {
    const stats = getCustomerStats(customer.id);
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.whatsapp && customer.whatsapp.includes(searchTerm)) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'ACTIVE_MOVES') return stats.activeMoves > 0;
    if (activeFilter === 'PENDING_DUES') return stats.totalOutstanding > 0;
    if (activeFilter === 'RECENT') {
      const daysOld = (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 3600 * 24);
      return daysOld <= 30;
    }
    return true;
  });

  // Overall directory statistics
  const totalOutstandingAll = customers.reduce((sum, c) => sum + getCustomerStats(c.id).totalOutstanding, 0);
  const totalActiveMovesAll = customers.reduce((sum, c) => sum + getCustomerStats(c.id).activeMoves, 0);

  const handleOpenAddModal = () => {
    setEditingCustomerId(null);
    setName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setSameAsPhone(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomerId(cust.id);
    setName(cust.name);
    setPhone(cust.phone);
    setWhatsapp(cust.whatsapp || cust.phone);
    setEmail(cust.email || '');
    setSameAsPhone(!cust.whatsapp || cust.whatsapp === cust.phone);
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toastError('Validation Error', 'Customer Name and Primary Phone Number are required.');
      return;
    }

    const waNumber = sameAsPhone ? phone.trim() : (whatsapp.trim() || phone.trim());

    try {
      if (editingCustomerId) {
        const updated: Customer = {
          id: editingCustomerId,
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: waNumber,
          email: email.trim(),
          createdAt: selectedCustomer?.createdAt || new Date().toISOString(),
        };
        await updateCustomer(updated);
        if (selectedCustomer?.id === editingCustomerId) {
          setSelectedCustomer(updated);
        }
        success('Customer Updated', `${updated.name}'s contact details were updated.`);
      } else {
        const newCustomer: Customer = {
          id: `cust-${Date.now()}`,
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: waNumber,
          email: email.trim(),
          createdAt: new Date().toISOString(),
        };
        await addCustomer(newCustomer);
        success('Customer Added', `${newCustomer.name} has been added to customer directory.`);
      }

      setIsAddModalOpen(false);
    } catch (err: any) {
      toastError('Unable to Save Customer', err?.message || 'Unable to save. Please check your connection and try again.');
    }
  };

  // Direct Call Action
  const handleCallCustomer = (phoneNum: string) => {
    const cleanPhone = phoneNum.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  // Copy phone number
  const handleCopyPhone = (cust: Customer) => {
    navigator.clipboard.writeText(cust.phone);
    setCopiedPhoneId(cust.id);
    success('Phone Copied', `${cust.phone} copied to clipboard.`);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // WhatsApp Message Launcher
  const openWhatsAppDirect = (phoneNum: string, customerName: string, customText?: string) => {
    const cleanPhone = phoneNum.replace(/[^0-9]/g, '');
    const defaultText = `Hello ${customerName}, Greetings from *${settings.companyName}*! How can we assist you with your moving, packing, or logistics requirements?`;
    const textToSend = customText || defaultText;
    const finalPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(textToSend)}`, '_blank');
  };

  const handleOpenWhatsAppModal = (cust: Customer) => {
    setWhatsAppModalCustomer(cust);
    setSelectedTemplate('greeting');
    setCustomWhatsAppMsg(
      `Hello ${cust.name}, Greetings from *${settings.companyName}*!\nWe are following up regarding your relocation and logistics requirements. Please feel free to reach out if you need quotes, packing assistance, or shifting updates.\n\n📞 ${settings.phone}\n🌐 ${settings.companyName}`
    );
  };

  const handleTemplateChange = (tmpl: string) => {
    if (!whatsAppModalCustomer) return;
    setSelectedTemplate(tmpl);
    const stats = getCustomerStats(whatsAppModalCustomer.id);

    if (tmpl === 'greeting') {
      setCustomWhatsAppMsg(
        `Hello ${whatsAppModalCustomer.name}, Greetings from *${settings.companyName}*!\nWe are following up regarding your relocation and logistics requirements. Please feel free to reach out if you need quotes, packing assistance, or shifting updates.\n\n📞 ${settings.phone}\n🌐 ${settings.companyName}`
      );
    } else if (tmpl === 'quote_followup') {
      setCustomWhatsAppMsg(
        `Hello ${whatsAppModalCustomer.name},\nWe have prepared the quotation for your upcoming shifting with *${settings.companyName}*. Please let us know if you have any questions or wish to confirm the schedule.\n\nBest Regards,\n${settings.companyName} Team`
      );
    } else if (tmpl === 'payment_reminder') {
      setCustomWhatsAppMsg(
        `Dear ${whatsAppModalCustomer.name},\nThis is a gentle payment update from *${settings.companyName}*. Outstanding balance: ${formatCurrency(stats.totalOutstanding)}. Please let us know once settled via UPI / Bank transfer.\n\nThank you for choosing us!`
      );
    } else if (tmpl === 'booking_status') {
      setCustomWhatsAppMsg(
        `Hello ${whatsAppModalCustomer.name},\nYour move booking with *${settings.companyName}* is confirmed! Our packing crew and transport team are prepared for on-time service.\n\nDispatch Helpline: ${settings.phone}`
      );
    }
  };

  const handleSendWhatsAppFromModal = () => {
    if (!whatsAppModalCustomer) return;
    openWhatsAppDirect(
      whatsAppModalCustomer.whatsapp || whatsAppModalCustomer.phone,
      whatsAppModalCustomer.name,
      customWhatsAppMsg
    );
    setWhatsAppModalCustomer(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10.5 h-10.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Clients</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{customers.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10.5 h-10.5 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Active Moves</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{totalActiveMovesAll}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10.5 h-10.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Quick Actions</p>
            <p className="text-xs font-bold text-emerald-800 mt-0.5">Call & WhatsApp</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10.5 h-10.5 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Dues</p>
            <p className="text-lg font-black text-amber-900 mt-0.5">{formatCurrency(totalOutstandingAll)}</p>
          </div>
        </div>
      </div>

      {/* Action Header & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="customers-search-input"
              type="text"
              placeholder="Search by customer name, phone number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Right Actions: View Mode + Add Customer */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Card Grid View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              id="btn-add-customer-modal"
              variant="primary"
              size="md"
              onClick={handleOpenAddModal}
              leftIcon={<Plus className="w-4 h-4 text-white" />}
              className="font-bold shrink-0"
            >
              Add New Customer
            </Button>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
          {[
            { id: 'ALL', label: `All (${customers.length})` },
            { id: 'ACTIVE_MOVES', label: `Active Moves (${totalActiveMovesAll})` },
            { id: 'PENDING_DUES', label: `Pending Dues (${customers.filter((c) => getCustomerStats(c.id).totalOutstanding > 0).length})` },
            { id: 'RECENT', label: 'Recently Added' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Card Grid View or Table View */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="w-8 h-8 text-slate-400" />}
            title="No customers found"
            description="No customer records match your filter or search query. Click below to add a new customer."
            actionLabel="Add Customer"
            onAction={handleOpenAddModal}
            actionIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
          />
        </Card>
      ) : viewMode === 'grid' ? (
        /* ==================== CARD GRID VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const stats = getCustomerStats(customer.id);
            return (
              <div
                key={customer.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Card Header & Profile */}
                <div className="p-4.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm ring-2 ring-indigo-100">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate leading-tight">{customer.name}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Added {formatDate(customer.createdAt)}</p>
                      </div>
                    </div>

                    {/* Dues or Active move Badge */}
                    {stats.totalOutstanding > 0 ? (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                        Due: {formatCurrency(stats.totalOutstanding)}
                      </span>
                    ) : stats.activeMoves > 0 ? (
                      <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Moving
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 border border-slate-200">
                        {stats.totalBookings} moves
                      </span>
                    )}
                  </div>

                  {/* Contact Information Bar with copy button */}
                  <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                      <button
                        onClick={() => handleCopyPhone(customer)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Copy phone number"
                      >
                        {copiedPhoneId === customer.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span className="text-[10px]">{copiedPhoneId === customer.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {customer.email && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Stats Summary Mini Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Bookings</span>
                      <span className="text-xs font-black text-slate-900 mt-0.5 block">{stats.totalBookings}</span>
                    </div>
                    <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase block">Paid</span>
                      <span className="text-xs font-black text-emerald-800 mt-0.5 block truncate">
                        {formatCurrency(stats.totalPaid)}
                      </span>
                    </div>
                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Enquiries</span>
                      <span className="text-xs font-black text-slate-800 mt-0.5 block">{stats.leads.length}</span>
                    </div>
                  </div>
                </div>

                {/* Prominent Direct Communication & Action Footer */}
                <div className="bg-slate-50 p-3 border-t border-slate-200/80 space-y-2">
                  {/* BIG EASY BUTTONS: CALL & WHATSAPP */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${customer.phone}`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsAppModal(customer)}
                      className="h-9 px-3 bg-[#25D366] hover:bg-[#1EBE5D] active:bg-[#16A34A] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* Secondary Quick Action Row */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setDetailTab('overview');
                        setIsDetailModalOpen(true);
                      }}
                      className="flex-1 py-1 px-2 text-[11px] font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-200/70 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-slate-500" />
                      <span>360 Profile</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(customer)}
                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 rounded-md transition-colors cursor-pointer"
                      title="Edit Customer Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        navigate(`/leads?search=${encodeURIComponent(customer.phone)}`);
                      }}
                      className="py-1 px-2 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                      title="Create or view leads for this customer"
                    >
                      <span>+ Lead</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==================== HIGH DENSITY TABLE VIEW ==================== */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact & Quick Dial</TableHead>
                <TableHead>Moves & Status</TableHead>
                <TableHead>Total Billed</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Balance Due</TableHead>
                <TableHead className="text-right">Quick Contact Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                return (
                  <TableRow
                    key={customer.id}
                    isClickable
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setDetailTab('overview');
                      setIsDetailModalOpen(true);
                    }}
                  >
                    {/* Customer Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{customer.name}</p>
                          <p className="text-[11px] text-slate-400">Added {formatDate(customer.createdAt)}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contacts & Quick Phone/WhatsApp Chips */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${customer.phone}`}
                            className="font-bold text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {customer.phone}
                          </a>
                          <button
                            onClick={() => handleCopyPhone(customer)}
                            title="Copy number"
                            className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                          >
                            {copiedPhoneId === customer.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {customer.email && (
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Moves */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {stats.totalBookings} moves
                        </span>
                        {stats.activeMoves > 0 && (
                          <span className="font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded text-[10px]">
                            {stats.activeMoves} Active
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Total Invoiced */}
                    <TableCell>
                      <span className="font-bold text-slate-900">{formatCurrency(stats.totalInvoiced)}</span>
                    </TableCell>

                    {/* Total Paid */}
                    <TableCell>
                      <span className="font-bold text-emerald-700">{formatCurrency(stats.totalPaid)}</span>
                    </TableCell>

                    {/* Outstanding */}
                    <TableCell>
                      {stats.totalOutstanding > 0 ? (
                        <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                          {formatCurrency(stats.totalOutstanding)}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">Nil</span>
                      )}
                    </TableCell>

                    {/* Direct Contact Quick Actions */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${customer.phone}`}
                          title={`Call ${customer.name}`}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Call</span>
                        </a>

                        <button
                          onClick={() => handleOpenWhatsAppModal(customer)}
                          title={`WhatsApp ${customer.name}`}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(customer)}
                          title="Edit Customer"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
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

      {/* ==================== WHATSAPP DIRECT MESSAGE MODAL ==================== */}
      {whatsAppModalCustomer && (
        <Modal
          isOpen={!!whatsAppModalCustomer}
          onClose={() => setWhatsAppModalCustomer(null)}
          title={`WhatsApp: ${whatsAppModalCustomer.name}`}
          subtitle={`Number: ${whatsAppModalCustomer.whatsapp || whatsAppModalCustomer.phone}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            {/* Quick Template Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Choose Quick Message Template:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'greeting', label: '👋 General Greeting / Intro' },
                  { id: 'quote_followup', label: '📋 Quotation Follow-up' },
                  { id: 'booking_status', label: '🚚 Move Confirmation' },
                  { id: 'payment_reminder', label: '💳 Payment Reminder' },
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleTemplateChange(tmpl.id)}
                    className={`p-2 rounded-lg text-left font-semibold border transition-all cursor-pointer ${
                      selectedTemplate === tmpl.id
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Message Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Message Preview (You can edit before opening):
              </label>
              <textarea
                rows={5}
                value={customWhatsAppMsg}
                onChange={(e) => setCustomWhatsAppMsg(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setWhatsAppModalCustomer(null)}>
                Cancel
              </Button>
              <button
                onClick={handleSendWhatsAppFromModal}
                className="h-9 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Open in WhatsApp</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ==================== ADD / EDIT CUSTOMER MODAL ==================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCustomerId ? 'Edit Customer Information' : 'Add New Customer Profile'}
        subtitle="Maintain verified phone and WhatsApp contact details for quick calling and updates"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <Input
            label="Full Customer Name *"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-2">
            <Input
              label="Primary Phone Number (For Direct Calling) *"
              placeholder="10-digit mobile number, e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-3.5 h-3.5 text-slate-400" />}
              required
            />

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sameAsPhone}
                onChange={(e) => {
                  setSameAsPhone(e.target.checked);
                  if (e.target.checked) setWhatsapp(phone);
                }}
                className="rounded text-slate-900 focus:ring-slate-900"
              />
              <span>WhatsApp number is same as primary phone</span>
            </label>

            {!sameAsPhone && (
              <Input
                label="WhatsApp Number"
                placeholder="Enter dedicated WhatsApp number"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
              />
            )}
          </div>

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="customer@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-3.5 h-3.5 text-slate-400" />}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingCustomerId ? 'Save Changes' : 'Register Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================== CUSTOMER 360 PROFILE & HISTORY MODAL ==================== */}
      {selectedCustomer && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedCustomer.name}
          subtitle={`Registered on ${formatDate(selectedCustomer.createdAt)}`}
          maxWidth="3xl"
        >
          {(() => {
            const stats = getCustomerStats(selectedCustomer.id);
            return (
              <div className="space-y-5">
                {/* Header Summary Banner with Call & WhatsApp Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white leading-snug">{selectedCustomer.name}</h4>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        📞 {selectedCustomer.phone}{' '}
                        {selectedCustomer.email && `• ✉️ ${selectedCustomer.email}`}
                      </p>
                    </div>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call
                    </a>

                    <button
                      onClick={() => handleOpenWhatsAppModal(selectedCustomer)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      WhatsApp
                    </button>

                    <button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleOpenEditModal(selectedCustomer);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>
                </div>

                {/* 4 Financial Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Bookings</span>
                    <span className="text-base font-black text-slate-900 mt-0.5 block">{stats.totalBookings}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Invoiced</span>
                    <span className="text-base font-black text-slate-900 mt-0.5 block">
                      {formatCurrency(stats.totalInvoiced)}
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Total Paid</span>
                    <span className="text-base font-black text-emerald-800 mt-0.5 block">
                      {formatCurrency(stats.totalPaid)}
                    </span>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <span className="text-[10px] text-amber-900 font-bold uppercase block">Outstanding</span>
                    <span className="text-base font-black text-amber-900 mt-0.5 block">
                      {formatCurrency(stats.totalOutstanding)}
                    </span>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-slate-200 text-xs font-bold overflow-x-auto">
                  {[
                    { id: 'overview', label: `Overview & Leads (${stats.leads.length})` },
                    { id: 'quotes', label: `Quotations (${stats.quotes.length})` },
                    { id: 'bookings', label: `Bookings (${stats.bookings.length})` },
                    { id: 'invoices', label: `Invoices (${stats.invoices.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setDetailTab(tab.id as any)}
                      className={`px-3 py-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                        detailTab === tab.id
                          ? 'border-slate-900 text-slate-900'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div className="min-h-[160px]">
                  {detailTab === 'overview' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-900">Enquiries & Relocation History</h5>
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => {
                            setIsDetailModalOpen(false);
                            navigate(`/leads?search=${encodeURIComponent(selectedCustomer.phone)}`);
                          }}
                          leftIcon={<Plus className="w-3 h-3" />}
                        >
                          New Lead
                        </Button>
                      </div>

                      {stats.leads.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-lg">
                          No lead enquiries recorded yet for this client.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                          {stats.leads.map((lead) => (
                            <div key={lead.id} className="p-3 text-xs flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{lead.pickupLocation.split(',')[0]}</span>
                                  <span className="text-slate-400">→</span>
                                  <span>{lead.dropLocation.split(',')[0]}</span>
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {formatDate(lead.movingDate)} • {lead.propertyType}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                  {lead.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === 'quotes' && (
                    <div className="space-y-3">
                      {stats.quotes.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-lg">
                          No quotations generated yet for this client.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                          {stats.quotes.map((q) => (
                            <div key={q.id} className="p-3 text-xs flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-900">{q.quotationNumber}</p>
                                <p className="text-[11px] text-slate-500">
                                  {q.pickupAddress} → {q.dropAddress}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-slate-900">{formatCurrency(q.grandTotal)}</p>
                                <span className="text-[10px] text-slate-400 font-semibold">{q.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === 'bookings' && (
                    <div className="space-y-3">
                      {stats.bookings.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-lg">
                          No confirmed bookings yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                          {stats.bookings.map((b) => (
                            <div key={b.id} className="p-3 text-xs flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-900">
                                  #{b.bookingNumber} • {formatDate(b.movingDate)}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {b.pickupLocation} → {b.dropLocation}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-slate-900">{formatCurrency(b.totalAmount)}</p>
                                <Badge variant="info" dot>{b.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === 'invoices' && (
                    <div className="space-y-3">
                      {stats.invoices.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-lg">
                          No invoices issued yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                          {stats.invoices.map((inv) => (
                            <div key={inv.id} className="p-3 text-xs flex justify-between items-center">
                              <div>
                                <p className="font-bold text-slate-900">{inv.invoiceNumber}</p>
                                <p className="text-[11px] text-slate-500">Due {formatDate(inv.dueDate)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</p>
                                <span
                                  className={`text-[10px] font-bold ${
                                    inv.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                                  }`}
                                >
                                  {inv.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
