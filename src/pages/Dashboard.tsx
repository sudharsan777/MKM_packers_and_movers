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
  CheckCircle2,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Truck,
  Wallet,
  Clock,
  MapPin,
  DollarSign,
  AlertCircle,
  Plus,
  ArrowDownRight,
  Calendar,
  Sparkles,
  Phone,
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

  // Lead pipeline data
  const pipelineStages = [
    { label: 'New', count: leads.filter((l) => l.status === 'New').length, color: 'bg-sky-500' },
    { label: 'Contacted', count: leads.filter((l) => l.status === 'Contacted').length, color: 'bg-amber-500' },
    { label: 'Follow-up', count: leads.filter((l) => l.status === 'Follow-up').length, color: 'bg-indigo-500' },
    { label: 'Quotation Sent', count: leads.filter((l) => l.status === 'Quotation Sent').length, color: 'bg-purple-500' },
    { label: 'Confirmed', count: leads.filter((l) => l.status === 'Confirmed').length, color: 'bg-emerald-500' },
  ];

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
      {/* Welcome Section & Quick Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="MKM Packers and Movers Logo"
            className="w-13 h-13 rounded-full object-cover shadow-sm ring-2 ring-indigo-500/80 shrink-0 bg-white"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {getGreeting()}, {settings.companyName}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Dispatch
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl truncate">
              {settings.address}
            </p>
          </div>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            id="dash-btn-new-lead"
            variant="primary"
            size="sm"
            onClick={() => navigate('/leads')}
            leftIcon={<Plus className="w-3.5 h-3.5 text-white" />}
          >
            New Lead
          </Button>
          <Button
            id="dash-btn-new-quote"
            variant="outline"
            size="sm"
            onClick={() => navigate('/quotations')}
            leftIcon={<FileText className="w-3.5 h-3.5 text-slate-500" />}
          >
            Quotation
          </Button>
          <Button
            id="dash-btn-new-booking"
            variant="outline"
            size="sm"
            onClick={() => navigate('/bookings')}
            leftIcon={<Truck className="w-3.5 h-3.5 text-slate-500" />}
          >
            Booking
          </Button>
          <Button
            id="dash-btn-new-invoice"
            variant="outline"
            size="sm"
            onClick={() => navigate('/invoices')}
            leftIcon={<Receipt className="w-3.5 h-3.5 text-slate-500" />}
          >
            Invoice
          </Button>
        </div>
      </div>

      {/* KPI Metrics Grid with Hierarchy */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Billed Revenue */}
        <Card
          className="cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all border-slate-200/80 bg-white"
          onClick={() => navigate('/invoices')}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Invoiced
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight my-1">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>Gross billed</span>
              <span className="text-slate-700 font-bold">{invoices.length} invoices</span>
            </p>
          </CardContent>
        </Card>

        {/* Cash Collected */}
        <Card
          className="cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all border-emerald-100 bg-emerald-50/30"
          onClick={() => navigate('/payments')}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Cash Received
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight my-1">
              {formatCurrency(totalReceived)}
            </div>
            <p className="text-[11px] text-emerald-700/80 font-medium flex items-center justify-between">
              <span>Settled in bank</span>
              <span className="font-bold">{payments.length} payments</span>
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Dues */}
        <Card
          className="cursor-pointer hover:border-amber-300 hover:shadow-md transition-all border-amber-200 bg-amber-50/40"
          onClick={() => navigate('/invoices')}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                Pending Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight my-1">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-[11px] text-amber-800/90 font-medium flex items-center justify-between">
              <span>Uncollected dues</span>
              <span className="font-bold">{outstandingInvoices.length} pending</span>
            </p>
          </CardContent>
        </Card>

        {/* Net Profit Card - Electric Royal Indigo Hero Card */}
        <Card
          className="cursor-pointer hover:shadow-xl transition-all bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 text-white border-transparent shadow-brand"
          onClick={() => navigate('/reports')}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-indigo-100 uppercase tracking-wider">
                Net Cash Profit
              </span>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight my-1">
              {formatCurrency(netProfit)}
            </div>
            <p className="text-[11px] text-indigo-100 font-medium flex items-center justify-between">
              <span>Collected vs {formatCurrency(totalExpenses)} exp</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Operational Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 text-xs shadow-2xs">
        <div
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          onClick={() => navigate('/leads')}
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">New Leads</p>
            <p className="text-sm font-bold text-slate-900">{newLeadsCount} / {totalLeadsCount} total</p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          onClick={() => navigate('/bookings')}
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Truck className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Active Moves</p>
            <p className="text-sm font-bold text-slate-900">{activeBookingsCount} on road</p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          onClick={() => navigate('/quotations')}
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Quotations</p>
            <p className="text-sm font-bold text-slate-900">{quotations.length} sent</p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
          onClick={() => navigate('/expenses')}
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <ArrowDownRight className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Expenses</p>
            <p className="text-sm font-bold text-rose-700">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Pipeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Flow Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-bold text-slate-900">
                Revenue vs Operating Expenses
              </CardTitle>
              <CardDescription>Monthly billed sales compared to operational overheads</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Expenses
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'revenue' ? 'Invoiced' : 'Operating Cost',
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expenses" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Conversion Pipeline */}
        <Card className="flex flex-col">
          <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-bold text-slate-900">Lead Pipeline Funnel</CardTitle>
              <CardDescription>Current stage of customer inquiries</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/leads')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              View All →
            </Button>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              {pipelineStages.map((stage) => {
                const percentage = totalLeadsCount > 0 ? Math.round((stage.count / totalLeadsCount) * 100) : 0;
                return (
                  <div key={stage.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{stage.label}</span>
                      <span className="text-slate-900">
                        {stage.count} <span className="text-slate-400 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${stage.color}`}
                        style={{ width: `${Math.max(6, (stage.count / Math.max(1, totalLeadsCount)) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 bg-slate-50/60 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Pipeline Value</span>
              <span className="font-extrabold text-slate-900">
                {formatCurrency(leads.reduce((s, l) => s + l.estimatedValue, 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations & Pending Invoices Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Moves Timeline */}
        <Card>
          <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-xs font-bold text-slate-900">Upcoming Shifting Schedule</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/bookings')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              All Bookings →
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No active bookings scheduled.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bookings.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => navigate('/bookings')}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{getCustomerName(b.customerId)}</span>
                        <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded font-semibold">
                          #{b.bookingNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{b.pickupLocation.split(',')[0]}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                        <span>{b.dropLocation.split(',')[0]}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-slate-800 block">
                        {formatDate(b.movingDate)}
                      </span>
                      <Badge variant="brand" dot className="mt-1">
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invoices for Follow-up */}
        <Card>
          <CardHeader className="py-3.5 px-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-xs font-bold text-slate-900">Pending Invoices</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/invoices')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              All Invoices →
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {outstandingInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-600 font-semibold">
                ✓ All issued invoices have been settled in full!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {outstandingInvoices.slice(0, 4).map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => navigate('/invoices')}
                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{getCustomerName(inv.customerId)}</span>
                        <span className="font-mono text-[10px] text-slate-500">{inv.invoiceNumber}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Due: {formatDate(inv.dueDate)} • Billed: {formatCurrency(inv.grandTotal)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-200 block">
                        Due {formatCurrency(inv.balanceDue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
