import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../store/AppContext';
import { formatCurrency } from '../utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  ArrowDownRight,
  Wallet,
  Receipt,
  DollarSign,
  Calendar,
  Truck,
  Users,
  Printer,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const Reports = () => {
  const { invoices, payments, expenses, bookings, leads } = useAppContext();
  const [timeframe, setTimeframe] = useState('ALL');

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalReceived = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalReceived - totalExpenses;
  const avgOrderValue = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0;

  // Monthly breakdown
  const monthlyData = [
    { name: 'Oct', revenue: 145000, expense: 62000 },
    { name: 'Nov', revenue: 210000, expense: 89000 },
    { name: 'Dec', revenue: 275000, expense: 115000 },
    { name: 'Jan', revenue: 230000, expense: 98000 },
    { name: 'Feb', revenue: 310000, expense: 125000 },
    {
      name: 'Mar (Live)',
      revenue: totalRevenue > 0 ? totalRevenue : 380000,
      expense: totalExpenses > 0 ? totalExpenses : 140000,
    },
  ];

  // Dynamic expense category aggregation
  const categoryMap: { [key: string]: number } = {};
  expenses.forEach((exp) => {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
  });

  const categoryData =
    Object.keys(categoryMap).length > 0
      ? Object.keys(categoryMap).map((k) => ({ name: k, value: categoryMap[k] }))
      : [
          { name: 'Fuel / Diesel', value: 45000 },
          { name: 'Driver & Labour', value: 38000 },
          { name: 'Packing Materials', value: 22000 },
          { name: 'Vehicle Repairs', value: 15000 },
          { name: 'Toll & Taxes', value: 8500 },
        ];

  const PIE_COLORS = ['#0F172A', '#D97706', '#059669', '#2563EB', '#DC2626', '#7C3AED', '#64748B'];

  // Lead source conversion breakdown
  const sourceMap: { [key: string]: { total: number; converted: number } } = {};
  leads.forEach((l) => {
    if (!sourceMap[l.source]) sourceMap[l.source] = { total: 0, converted: 0 };
    sourceMap[l.source].total += 1;
    if (l.status === 'Confirmed') sourceMap[l.source].converted += 1;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Financial & Operations Intelligence
          </h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Profit & Loss statements, gross billed revenue, cash inflows, and operating expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            id="reports-timeframe-select"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="h-9 px-3 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
          >
            <option value="ALL">All Time</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="THIS_QUARTER">This Quarter</option>
            <option value="FY24">FY 2024-25</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border-slate-200/80 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Gross Billed
              </span>
              <div className="w-8.5 h-8.5 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 my-1">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">All invoices issued</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/20 border-emerald-200/80 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Total Collections
              </span>
              <div className="w-8.5 h-8.5 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 my-1">
              {formatCurrency(totalReceived)}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">Realized cash in bank</p>
          </CardContent>
        </Card>

        <Card className="bg-rose-50/20 border-rose-200/80 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                Operating Cost
              </span>
              <div className="w-8.5 h-8.5 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 my-1">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-[11px] text-rose-700 font-medium">Fuel, wages, overheads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 text-white border-transparent shadow-brand">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-indigo-100 uppercase tracking-wider">
                Net Cash Profit
              </span>
              <div className="w-8.5 h-8.5 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white my-1">
              {formatCurrency(netProfit)}
            </div>
            <p className="text-[11px] text-indigo-100 font-medium">
              Margin: {totalReceived > 0 ? Math.round((netProfit / totalReceived) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section: Monthly & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly P&L Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="py-3 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-bold text-slate-900">
                Monthly Inflows vs Operating Overhead
              </CardTitle>
              <CardDescription>Visual comparison of sales vs operational expense</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0F172A]" /> Invoiced
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Expenses
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
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
                  <RechartsTooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                    formatter={(val: number, name: string) => [
                      formatCurrency(val),
                      name === 'revenue' ? 'Inflow' : 'Outflow',
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#0F172A" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expense" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Distribution Donut */}
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100">
            <CardTitle className="text-xs font-bold text-slate-900">Operating Cost Breakdown</CardTitle>
            <CardDescription>Overhead allocation by category</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 flex flex-col items-center justify-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => [formatCurrency(value), 'Spent']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-1.5 mt-2">
              {categoryData.slice(0, 4).map((cat, idx) => (
                <div key={cat.name} className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="truncate max-w-[120px]">{cat.name}</span>
                  </span>
                  <span className="font-bold text-slate-900">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business KPIs Summary Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Average Order Value</span>
          <p className="text-lg font-black text-slate-900">{formatCurrency(avgOrderValue)}</p>
          <p className="text-slate-500">Calculated across {bookings.length} confirmed shifting jobs</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Collection Efficiency</span>
          <p className="text-lg font-black text-emerald-700">
            {totalRevenue > 0 ? Math.round((totalReceived / totalRevenue) * 100) : 100}%
          </p>
          <p className="text-slate-500">Collected amount relative to total gross billed</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Total Shifting Fleet Jobs</span>
          <p className="text-lg font-black text-slate-900">{bookings.length} Relocations</p>
          <p className="text-slate-500">{leads.length} total customer enquiries captured</p>
        </div>
      </div>
    </div>
  );
};
