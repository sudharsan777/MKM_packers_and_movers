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
  Truck,
  Calendar,
  MapPin,
  MessageCircle,
  FileText,
  Receipt,
  CheckCircle2,
  User,
  Trash2,
  Phone,
  PhoneCall,
  Eye,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Download,
  LayoutGrid,
  List,
  Edit3,
  Users,
  Clock,
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { generateLRPDF } from '../utils/pdfExport';

export const Bookings = () => {
  const navigate = useNavigate();
  const {
    bookings,
    customers,
    settings,
    addBooking,
    updateBooking,
    deleteBooking,
    addInvoice,
    generateNextBookingNumber,
    generateNextInvoiceNumber,
  } = useAppContext();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Booking Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [movingDate, setMovingDate] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [vehicle, setVehicle] = useState('14ft Closed Container (TN-01-AB-1234)');
  const [driver, setDriver] = useState('Murugan (98765 12345)');
  const [workers, setWorkers] = useState('4');
  const [totalAmount, setTotalAmount] = useState('18000');
  const [advanceAmount, setAdvanceAmount] = useState('5000');
  const [status, setStatus] = useState<BookingStatus>('Confirmed');
  const [notes, setNotes] = useState('Handle delicate glassware and furniture with extra transit padding.');

  const getCustomer = (id: string) => customers.find((c) => c.id === id);
  const getCustomerName = (id: string) => getCustomer(id)?.name || 'Customer';
  const getCustomerPhone = (id: string) => getCustomer(id)?.phone || '';

  const getStatusBadge = (bStatus: BookingStatus) => {
    switch (bStatus) {
      case 'Confirmed':
        return { variant: 'info' as const, label: 'Confirmed' };
      case 'Packing':
      case 'Loading':
        return { variant: 'warning' as const, label: bStatus };
      case 'In Transit':
        return { variant: 'accent' as const, label: 'In Transit' };
      case 'Delivered':
      case 'Completed':
        return { variant: 'success' as const, label: bStatus };
      case 'Cancelled':
        return { variant: 'danger' as const, label: 'Cancelled' };
      default:
        return { variant: 'neutral' as const, label: bStatus };
    }
  };

  const handleOpenCreateModal = () => {
    setEditingBookingId(null);
    if (customers.length > 0) setCustomerId(customers[0].id);
    setMovingDate(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]);
    setPickupLocation('');
    setDropLocation('');
    setVehicle('14ft Closed Container (TN-01-AB-1234)');
    setDriver('Murugan (98765 12345)');
    setWorkers('4');
    setTotalAmount('18000');
    setAdvanceAmount('5000');
    setStatus('Confirmed');
    setNotes('Handle delicate glassware and furniture with extra transit padding.');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (b: Booking) => {
    setEditingBookingId(b.id);
    setCustomerId(b.customerId);
    setMovingDate(b.movingDate);
    setPickupLocation(b.pickupLocation);
    setDropLocation(b.dropLocation);
    setVehicle(b.vehicle);
    setDriver(b.driver);
    setWorkers(b.workers.toString());
    setTotalAmount(b.totalAmount.toString());
    setAdvanceAmount(b.advanceAmount.toString());
    setStatus(b.status);
    setNotes(b.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupLocation.trim() || !dropLocation.trim()) {
      toastError('Missing Details', 'Please provide pickup and drop addresses.');
      return;
    }

    const total = Number(totalAmount) || 0;
    const advance = Number(advanceAmount) || 0;
    const balance = Math.max(0, total - advance);

    try {
      if (editingBookingId) {
        const existing = bookings.find((b) => b.id === editingBookingId);
        const updated: Booking = {
          id: editingBookingId,
          bookingNumber: existing?.bookingNumber || `BKG-${Date.now().toString().slice(-4)}`,
          customerId,
          movingDate,
          pickupLocation: pickupLocation.trim(),
          dropLocation: dropLocation.trim(),
          vehicle,
          driver,
          workers: Number(workers) || 2,
          status,
          totalAmount: total,
          advanceAmount: advance,
          balanceAmount: balance,
          notes,
          createdAt: existing?.createdAt || new Date().toISOString(),
        };
        await updateBooking(updated);
        success('Order Updated', `Shifting order #${updated.bookingNumber} has been updated.`);
      } else {
        let bookingNumber = `BKG-${Date.now().toString().slice(-4)}`;
        try {
          bookingNumber = await generateNextBookingNumber();
        } catch (e) {
          console.warn('Fallback booking counter:', e);
        }

        const newBooking: Booking = {
          id: `bkg-${Date.now()}`,
          bookingNumber,
          customerId,
          movingDate,
          pickupLocation: pickupLocation.trim(),
          dropLocation: dropLocation.trim(),
          vehicle,
          driver,
          workers: Number(workers) || 2,
          status: 'Confirmed',
          totalAmount: total,
          advanceAmount: advance,
          balanceAmount: balance,
          notes,
          createdAt: new Date().toISOString(),
        };
        await addBooking(newBooking);
        success('Order Created', `Shifting order #${bookingNumber} recorded.`);
      }

      setIsAddModalOpen(false);
    } catch (err: any) {
      toastError('Unable to Save Order', err?.message || 'Unable to save. Please check your connection and try again.');
    }
  };

  const handleUpdateStatus = async (b: Booking, newStatus: BookingStatus) => {
    const updated = { ...b, status: newStatus };
    updateBooking(updated);
    if (selectedBooking?.id === b.id) setSelectedBooking(updated);
    success('Status Updated', `Order #${b.bookingNumber} is now ${newStatus}.`);
  };

  const handleGenerateInvoice = async (booking: Booking) => {
    let invNum = `${settings.invoicePrefix}${Date.now().toString().slice(-4)}`;
    try {
      invNum = await generateNextInvoiceNumber();
    } catch (e) {
      console.warn('Fallback numbering for invoice:', e);
    }

    const tax = 0;
    const grandTotal = booking.totalAmount;
    const paymentStatus =
      booking.balanceAmount === 0 ? 'Paid' : booking.advanceAmount > 0 ? 'Partially Paid' : 'Unpaid';

    try {
      await addInvoice({
        id: `inv-${Date.now()}`,
        invoiceNumber: invNum,
        bookingId: booking.id,
        customerId: booking.customerId,
        customerName: getCustomerName(booking.customerId),
        customerPhone: getCustomerPhone(booking.customerId),
        moveFromAddress: booking.pickupLocation,
        moveToAddress: booking.dropLocation,
        vehicleNo: booking.vehicle.split('(')[1]?.replace(')', '') || 'TN 88 L 5186',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        items: [
          {
            id: '1',
            service: 'Relocation & Dedicated Freight Charges',
            description: `Door-to-door shift from ${booking.pickupLocation} to ${booking.dropLocation}`,
            qty: 1,
            unitPrice: booking.totalAmount,
            discount: 0,
            amount: booking.totalAmount,
          },
          {
            id: '2',
            service: 'Handling & Labour Charges',
            description: `Crew: ${booking.driver} + ${booking.workers} helpers`,
            qty: 1,
            unitPrice: 0,
            discount: 0,
            amount: 0,
          },
        ],
        subtotal: booking.totalAmount,
        discount: 0,
        tax,
        grandTotal,
        amountPaid: booking.advanceAmount,
        balanceDue: grandTotal - booking.advanceAmount,
        status: paymentStatus,
        notes: booking.notes,
        createdAt: new Date().toISOString(),
      });

      success('Invoice Issued', `Tax invoice ${invNum} created for this move.`);
      setIsDetailModalOpen(false);
      navigate('/invoices');
    } catch (err: any) {
      toastError('Invoice Creation Failed', err?.message || 'Unable to generate invoice.');
    }
  };

  const handleSendStatusWhatsApp = (booking: Booking) => {
    const cust = getCustomer(booking.customerId);
    const phone = (cust?.whatsapp || cust?.phone || '').replace(/[^0-9]/g, '');
    const text = `*SHIFTING ORDER UPDATE — ${settings.companyName.toUpperCase()}*\n\nDear ${cust?.name},\nYour booking *#${booking.bookingNumber}* status is: *${booking.status.toUpperCase()}*.\n\n📅 Moving Date: ${formatDate(booking.movingDate)}\n🚛 Vehicle: ${booking.vehicle}\n👤 Driver: ${booking.driver}\n📍 From: ${booking.pickupLocation}\n📍 To: ${booking.dropLocation}\n\n💰 Total Amount: ₹${booking.totalAmount.toLocaleString('en-IN')}\n✅ Advance Paid: ₹${booking.advanceAmount.toLocaleString('en-IN')}\n*⚠️ Balance Due: ₹${booking.balanceAmount.toLocaleString('en-IN')}*\n\nCall our hotline ${settings.phone} for any assistance.\n\nThank you for choosing ${settings.companyName}!`;
    const finalPhone = phone.length === 10 ? '91' + phone : phone;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDeleteBooking = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shifting order?')) {
      deleteBooking(id);
      success('Order Deleted', 'The booking was removed.');
      if (selectedBooking?.id === id) setIsDetailModalOpen(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const cust = getCustomer(b.customerId);
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust?.phone.includes(searchTerm) ||
      b.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.dropLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBookingValue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const activeMovesCount = bookings.filter(
    (b) => b.status === 'In Transit' || b.status === 'Loading' || b.status === 'Packing'
  ).length;

  return (
    <div className="space-y-4">
      {/* ULTRA SLIM MINI STATS BAR */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Total Orders:</span>
          <span className="font-extrabold text-slate-900">{bookings.length}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Active Moves:</span>
          <span className="font-extrabold text-amber-900">{activeMovesCount}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Order Volume:</span>
          <span className="font-extrabold text-emerald-700">{formatCurrency(totalBookingValue)}</span>
        </div>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
          <span>Delivered/Done:</span>
          <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            {bookings.filter((b) => b.status === 'Delivered' || b.status === 'Completed').length}
          </span>
        </div>
      </div>

      {/* Header Search & Actions */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="bookings-search-input"
              type="text"
              placeholder="Search by order #, customer, driver, route..."
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
              id="btn-add-booking-modal"
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
              className="font-bold shrink-0"
            >
              New Order
            </Button>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {[
            { id: 'ALL', label: `All (${bookings.length})` },
            { id: 'Confirmed', label: `Confirmed (${bookings.filter((b) => b.status === 'Confirmed').length})` },
            { id: 'Packing', label: `Packing (${bookings.filter((b) => b.status === 'Packing').length})` },
            { id: 'Loading', label: `Loading (${bookings.filter((b) => b.status === 'Loading').length})` },
            { id: 'In Transit', label: `In Transit (${bookings.filter((b) => b.status === 'In Transit').length})` },
            { id: 'Delivered', label: `Delivered (${bookings.filter((b) => b.status === 'Delivered').length})` },
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
      {filteredBookings.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Truck className="w-8 h-8 text-slate-400" />}
            title="No orders found"
            description="Schedule a new relocation move, assign vehicles, and issue official Lorry Receipts."
            actionLabel="New Order"
            onAction={handleOpenCreateModal}
            actionIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
          />
        </Card>
      ) : viewMode === 'grid' ? (
        /* ==================== CARD GRID VIEW WITH ALL BUTTONS ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBookings.map((b) => {
            const customer = getCustomer(b.customerId);
            const statusInfo = getStatusBadge(b.status);
            const cleanPhone = customer?.phone.replace(/[^0-9]/g, '') || '';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-150 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono font-black text-slate-900 text-sm block">
                        #{b.bookingNumber}
                      </span>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Move: {formatDate(b.movingDate)}</span>
                      </p>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateStatus(b, e.target.value as BookingStatus)}
                      className="text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 focus:outline-none cursor-pointer"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packing">Packing</option>
                      <option value="Loading">Loading</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Customer Information & Quick Call */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{customer?.name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-600 font-medium">{customer?.phone}</p>
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
                        onClick={() => handleSendStatusWhatsApp(b)}
                        title="Send WhatsApp Update"
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
                      <span className="truncate">{b.pickupLocation.split(',')[0]}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{b.dropLocation.split(',')[0]}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate pl-5">
                      {b.pickupLocation} ➔ {b.dropLocation}
                    </p>
                  </div>

                  {/* Vehicle & Driver */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="truncate">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Vehicle</span>
                      <span className="font-bold text-slate-800 truncate block">🚛 {b.vehicle.split('(')[0]}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Driver & Crew</span>
                      <span className="font-bold text-slate-800 truncate block">👤 {b.driver.split('(')[0]} ({b.workers}p)</span>
                    </div>
                  </div>

                  {/* Pricing Overview */}
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 font-bold">
                    <span className="text-slate-600">
                      Total: <span className="text-slate-900">{formatCurrency(b.totalAmount)}</span>
                    </span>
                    <span className="text-amber-700">
                      Bal Due: {formatCurrency(b.balanceAmount)}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer with All Buttons */}
                <div className="bg-slate-50/80 p-2.5 border-t border-slate-100 space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        generateLRPDF(b, customer, settings);
                        success('LR Downloaded', `Lorry Receipt for Order #${b.bookingNumber} downloaded.`);
                      }}
                      className="h-8 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download LR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerateInvoice(b)}
                      className="h-8 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-slate-950" />
                      <span>Issue Invoice</span>
                    </button>
                  </div>

                  {/* Secondary Quick Actions */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/50">
                    <button
                      onClick={() => handleOpenEditModal(b)}
                      className="py-0.5 px-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setIsDetailModalOpen(true);
                      }}
                      className="py-0.5 px-2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => handleDeleteBooking(b.id)}
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
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Move Date</TableHead>
                <TableHead>Vehicle & Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Financials</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((b) => {
                const customer = getCustomer(b.customerId);
                const statusInfo = getStatusBadge(b.status);
                return (
                  <TableRow
                    key={b.id}
                    isClickable
                    onClick={() => {
                      setSelectedBooking(b);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <TableCell>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        #{b.bookingNumber}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-900 truncate">{customer?.name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-500">{customer?.phone}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="font-bold text-slate-800 text-xs truncate">
                        {b.pickupLocation.split(',')[0]} ➔ {b.dropLocation.split(',')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{b.pickupLocation}</p>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-slate-700 whitespace-nowrap text-xs">
                        {formatDate(b.movingDate)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-[11px]">
                        <p className="font-bold text-slate-800 truncate">🚛 {b.vehicle.split('(')[0]}</p>
                        <p className="text-slate-500 truncate">👤 {b.driver.split('(')[0]}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={statusInfo.variant} dot>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-900 block">{formatCurrency(b.totalAmount)}</span>
                        <span className="text-amber-700 font-medium">Due: {formatCurrency(b.balanceAmount)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(b)}
                          title="Edit Order"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            generateLRPDF(b, customer, settings);
                            success('LR Downloaded', `Lorry Receipt for Order #${b.bookingNumber} downloaded.`);
                          }}
                          title="Download LR (PDF)"
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendStatusWhatsApp(b)}
                          title="WhatsApp Update"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleGenerateInvoice(b)}
                          title="Issue Tax Invoice"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Receipt className="w-4 h-4" />
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

      {/* Create / Edit Booking Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingBookingId ? 'Edit Shifting Order' : 'Create Shifting Order'}
        subtitle="Schedule move dates, assign vehicle and crew, and set pricing"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveBooking} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              label="Pickup Address (Origin) *"
              placeholder="e.g. West Mambalam, Chennai"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
            />
            <Input
              label="Drop Address (Destination) *"
              placeholder="e.g. Senthamizh Nagar, Sivagangai"
              value={dropLocation}
              onChange={(e) => setDropLocation(e.target.value)}
              required
            />
            <Input
              label="Assigned Vehicle"
              placeholder="e.g. 14ft Eicher (TN-88-L-5186)"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
            />
            <Input
              label="Driver Name & Contact"
              placeholder="e.g. Murugan (9876543210)"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
            />
            <Input
              label="Crew Helpers Count"
              type="number"
              min="1"
              value={workers}
              onChange={(e) => setWorkers(e.target.value)}
            />
            <Select
              label="Order Move Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              options={[
                { label: 'Confirmed', value: 'Confirmed' },
                { label: 'Packing', value: 'Packing' },
                { label: 'Loading', value: 'Loading' },
                { label: 'In Transit', value: 'In Transit' },
                { label: 'Delivered', value: 'Delivered' },
                { label: 'Completed', value: 'Completed' },
                { label: 'Cancelled', value: 'Cancelled' },
              ]}
            />
            <Input
              label="Total Quotation Amount (₹) *"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
            />
            <Input
              label="Advance Paid Deposit (₹)"
              type="number"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
            />
          </div>

          <Textarea
            label="Special Handling Instructions"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingBookingId ? 'Save Order' : 'Create Order'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Order #${selectedBooking.bookingNumber}`}
          subtitle={`Moving on ${formatDate(selectedBooking.movingDate)}`}
          maxWidth="2xl"
          footer={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteBooking(selectedBooking.id)}
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
                    const cust = getCustomer(selectedBooking.customerId);
                    generateLRPDF(selectedBooking, cust, settings);
                    success('LR Downloaded', `Lorry Receipt for Order #${selectedBooking.bookingNumber} downloaded.`);
                  }}
                  leftIcon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
                >
                  Download LR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendStatusWhatsApp(selectedBooking)}
                  leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleGenerateInvoice(selectedBooking)}
                  leftIcon={<Receipt className="w-3.5 h-3.5 text-white" />}
                >
                  Issue Tax Invoice
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Status Switcher Strip */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Current Move Status</span>
                <span className="text-base font-black">{selectedBooking.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Change:</span>
                <select
                  value={selectedBooking.status}
                  onChange={(e) => handleUpdateStatus(selectedBooking, e.target.value as BookingStatus)}
                  className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packing">Packing</option>
                  <option value="Loading">Loading</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Route Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Customer</span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {getCustomerName(selectedBooking.customerId)}
                </h4>
                <p className="text-slate-600 text-xs">{getCustomerPhone(selectedBooking.customerId)}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Crew & Vehicle</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">🚛 {selectedBooking.vehicle}</p>
                <p className="text-slate-600 text-xs">👤 Driver: {selectedBooking.driver}</p>
                <p className="text-slate-600 text-xs">👥 Helpers: {selectedBooking.workers} members</p>
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Relocation Route
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Pickup (Origin)</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedBooking.pickupLocation}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Drop (Destination)</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedBooking.dropLocation}</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 grid grid-cols-3 text-center">
              <div>
                <span className="text-[10px] text-indigo-900 font-bold uppercase block">Total Price</span>
                <span className="text-sm font-black text-slate-900">{formatCurrency(selectedBooking.totalAmount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-900 font-bold uppercase block">Advance Paid</span>
                <span className="text-sm font-black text-emerald-800">{formatCurrency(selectedBooking.advanceAmount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-900 font-bold uppercase block">Balance Due</span>
                <span className="text-sm font-black text-amber-900">{formatCurrency(selectedBooking.balanceAmount)}</span>
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Instructions</span>
                <p className="text-slate-700 text-xs mt-0.5">{selectedBooking.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
