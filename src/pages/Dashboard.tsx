import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Input';
import { useAppContext } from '../store/AppContext';
import { formatCurrency, formatDate } from '../utils';
import {
  Users,
  FileText,
  Receipt,
  TrendingUp,
  ArrowRight,
  Truck,
  MapPin,
  Plus,
  ArrowUpRight,
  Phone,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { settings, leads, quotations, bookings, invoices, customers, expenses, payments } =
    useAppContext();

  // Metrics calculation
  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter((l) => l.status === 'New').length;
  const activeBookings = bookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'Packing' || b.status === 'Loading' || b.status === 'In Transit'
  );
  const activeBookingsCount = activeBookings.length;

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalReceived = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalReceived - totalExpenses;

  const getCustomer = (id: string) => customers.find((c) => c.id === id);
  const getCustomerName = (id: string) => getCustomer(id)?.name || 'Customer';

  const revenueChartData = [
    { month: 'Oct', revenue: 145000, expenses: 65000 },
    { month: 'Nov', revenue: 190000, expenses: 82000 },
    { month: 'Dec', revenue: 250000, expenses: 110000 },
    { month: 'Jan', revenue: 210000, expenses: 95000 },
    { month: 'Feb', revenue: 290000, expenses: 120000 },
    {
      month: 'Mar (Live)',
      revenue: totalRevenue > 0 ? totalRevenue : 320000,
      expenses: totalExpenses > 0 ? totalExpenses : 135000,
    },
  ];

  const outstandingInvoices = invoices.filter((i) => i.balanceDue > 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Actions Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="MKM Packers and Movers"
            className="w-12 h-12 rounded-full object-cover ring-1 ring-amber-400 bg-white shrink-0 shadow-subtle"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {getGreeting()}, {settings.companyName}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Cloud Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5 max-w-xl truncate">
              {settings.address || 'Chennai & Nationwide Relocation Logistics'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            id="dash-btn-new-lead"
            variant="primary"
            size="sm"
            onClick={() => navigate('/leads')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Lead
          </Button>
          <Button
            id="dash-btn-new-quote"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/quotations')}
            leftIcon={<FileText className="w-3.5 h-3.5 text-slate-500" />}
          >
            Quotation
          </Button>
          <Button
            id="dash-btn-new-booking"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/bookings')}
            leftIcon={<Truck className="w-3.5 h-3.5 text-slate-500" />}
          >
            Move Order
          </Button>
          <Button
            id="dash-btn-new-invoice"
            variant="secondary"
            size="sm"
            onClick={() => navigate('/invoices')}
            leftIcon={<Receipt className="w-3.5 h-3.5 text-slate-500" />}
          >
            Invoice
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed Revenue */}
        <Card
          className="cursor-pointer hover:border-slate-300 transition-all"
          onClick={() => navigate('/invoices')}
        >
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Total Invoiced
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Gross billed volume</span>
              <span className="font-semibold text-slate-700">{invoices.length} invoices</span>
            </div>
          </CardContent>
        </Card>

        {/* Realized Collections */}
        <Card
          className="cursor-pointer hover:border-slate-300 transition-all"
          onClick={() => navigate('/payments')}
        >
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">
                Settled Collections
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-700 tracking-tight tabular-nums">
              {formatCurrency(totalReceived)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Net operating profit</span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                {formatCurrency(netProfit > 0 ? netProfit : 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Receivables */}
        <Card
          className="cursor-pointer hover:border-slate-300 transition-all"
          onClick={() => navigate('/invoices')}
        >
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800">
                Outstanding Balance
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-700 tracking-tight tabular-nums">
              {formatCurrency(totalOutstanding)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Pending settlement</span>
              <span className="font-semibold text-amber-700">{outstandingInvoices.length} pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Dispatch Moves */}
        <Card
          className="cursor-pointer hover:border-slate-300 transition-all"
          onClick={() => navigate('/bookings')}
        >
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Active Operations
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Truck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {activeBookingsCount} Moves
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span>Enquiry pipeline</span>
              <span className="font-semibold text-slate-700">{totalLeadsCount} active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Financial Chart */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Financial Performance & Revenue Velocity</CardTitle>
            <CardDescription>Billed invoices vs. operating expenditure breakdown</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0F172A]" />
              <span className="text-slate-600 font-medium">Billed Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
              <span className="text-slate-600 font-medium">Operating Expenses</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-slate-300">{label}</p>
                          <p className="text-white">Revenue: {formatCurrency(payload[0]?.value as number)}</p>
                          <p className="text-slate-400">Expenses: {formatCurrency(payload[1]?.value as number)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#0F172A" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expenses" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Section: Active Dispatch & Outstanding Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Dispatch Moves */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Active Move Orders</CardTitle>
              <CardDescription>Real-time vehicle and crew tracking</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/bookings')}
              rightIcon={<ArrowRight className="w-3 h-3" />}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Truck className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">No Move Orders Scheduled</p>
                <p className="text-[11px] text-slate-400">Create a move order from an enquiry or quotation.</p>
              </div>
            ) : (
              bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => navigate('/bookings')}
                  className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {getCustomerName(booking.customerId)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        #{booking.bookingNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{booking.pickupLocation} → {booking.dropLocation}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <Badge
                      variant={
                        booking.status === 'Completed'
                          ? 'success'
                          : booking.status === 'In Transit'
                          ? 'warning'
                          : 'brand'
                      }
                    >
                      {booking.status}
                    </Badge>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {formatDate(booking.movingDate)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Outstanding Receivables */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Outstanding Invoices</CardTitle>
              <CardDescription>Pending customer collections and balances</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/invoices')}
              rightIcon={<ArrowRight className="w-3 h-3" />}
            >
              View Invoices
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {outstandingInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">All Invoices Settled</p>
                <p className="text-[11px] text-slate-400">No overdue receivables or pending balances.</p>
              </div>
            ) : (
              outstandingInvoices.slice(0, 5).map((invoice) => (
                <div
                  key={invoice.id}
                  onClick={() => navigate('/invoices')}
                  className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {getCustomerName(invoice.customerId)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Due: {formatDate(invoice.dueDate || invoice.date)}
                    </p>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-xs font-bold text-amber-800 tabular-nums">
                      {formatCurrency(invoice.balanceDue)}
                    </div>
                    <Badge variant="warning">
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
