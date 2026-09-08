import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  DollarSign,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { formatCurrency } from '../utils';
import { formatRupeeDoc, formatInvoiceDate, formatQuotationDate } from '../utils/pdfExport';

export const Overview = () => {
  const { invoices, quotations } = useAppContext();

  // Metrics calculations
  const totalInvoiced = invoices.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0);
  const totalCollected = invoices.reduce((sum, i) => sum + (Number(i.amountPaid) || 0), 0);
  const totalOutstanding = invoices.reduce(
    (sum, i) => sum + (Number(i.balanceDue) || (i.status !== 'Paid' ? Number(i.grandTotal) : 0)),
    0
  );

  const paidInvoicesCount = invoices.filter((i) => i.status === 'Paid').length;
  const partiallyPaidCount = invoices.filter((i) => i.status === 'Partially Paid').length;
  const unpaidCount = invoices.filter((i) => i.status === 'Unpaid' || i.status === 'Overdue').length;

  const totalQuotesValue = quotations.reduce((sum, q) => sum + (Number(q.grandTotal) || 0), 0);
  const acceptedQuotesCount = quotations.filter((q) => q.status === 'Accepted').length;

  const recentInvoices = [...invoices].slice(0, 4);
  const recentQuotations = [...quotations].slice(0, 4);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE5DC] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#1A1D20] tracking-tight">
              Business Overview & Summary
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6F0] text-[#9E7B4F] border border-[#DFC9AE]">
              Live Metrics
            </span>
          </div>
          <p className="text-xs text-[#718292] mt-1 font-normal">
            Consolidated totals, outstanding amounts, and pipeline metrics for MKM Packers & Movers
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <NavLink
            to="/invoices"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#9E7B4F] hover:bg-[#8A6A3E] text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>Manage Invoices</span>
          </NavLink>
          <NavLink
            to="/quotations"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#1A1D20] border border-[#EAE5DC] font-bold rounded-xl text-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-[#9E7B4F]" />
            <span>Quotations</span>
          </NavLink>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Invoiced */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE5DC] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718292] uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] border border-[#E8DFD1] flex items-center justify-center text-[#9E7B4F]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#1A1D20] mt-3">
            {formatRupeeDoc(totalInvoiced)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-semibold text-[#9E7B4F] bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#E8DFD1]">
              {invoices.length} Total Invoices
            </span>
            <span className="text-[11px] text-[#718292]">recorded in Cloud DB</span>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE5DC] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718292] uppercase tracking-wider">
              Outstanding Due
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FDF0F0] border border-[#F9D2D2] flex items-center justify-center text-[#D9534F]">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#D9534F] mt-3">
            {formatRupeeDoc(totalOutstanding)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold text-[#D9534F] bg-[#FDF0F0] px-2 py-0.5 rounded-md border border-[#F9D2D2]">
              {unpaidCount + partiallyPaidCount} Pending
            </span>
            <span className="text-[11px] text-[#718292]">unsettled payments</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE5DC] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718292] uppercase tracking-wider">
              Total Collected
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F7F0] border border-[#BDEBD6] flex items-center justify-center text-[#1B9B6A]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#1B9B6A] mt-3">
            {formatRupeeDoc(totalCollected)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold text-[#1B9B6A] bg-[#E6F7F0] px-2 py-0.5 rounded-md border border-[#BDEBD6]">
              {paidInvoicesCount} Fully Paid
            </span>
            <span className="text-[11px] text-[#718292]">settled accounts</span>
          </div>
        </div>

        {/* Total Quotations Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE5DC] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718292] uppercase tracking-wider">
              Quotations Pipeline
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] border border-[#E8DFD1] flex items-center justify-center text-[#9E7B4F]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#1A1D20] mt-3">
            {formatRupeeDoc(totalQuotesValue)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold text-[#9E7B4F] bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#E8DFD1]">
              {quotations.length} Estimates
            </span>
            <span className="text-[11px] text-[#718292]">{acceptedQuotesCount} Accepted</span>
          </div>
        </div>

        {/* Invoice Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE5DC] shadow-xs sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#718292] uppercase tracking-wider">
              Invoice Status Distribution
            </span>
            <span className="text-xs text-[#718292]">Payment status overview</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-3 bg-[#E6F7F0] border border-[#BDEBD6] rounded-xl">
              <p className="text-xs font-bold text-[#1B9B6A]">Paid</p>
              <p className="text-lg font-black text-[#1B9B6A] mt-0.5">{paidInvoicesCount}</p>
            </div>
            <div className="p-3 bg-[#FAF6F0] border border-[#E8DFD1] rounded-xl">
              <p className="text-xs font-bold text-[#9E7B4F]">Partially Paid</p>
              <p className="text-lg font-black text-[#9E7B4F] mt-0.5">{partiallyPaidCount}</p>
            </div>
            <div className="p-3 bg-[#FDF0F0] border border-[#F9D2D2] rounded-xl">
              <p className="text-xs font-bold text-[#D9534F]">Unpaid</p>
              <p className="text-lg font-black text-[#D9534F] mt-0.5">{unpaidCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE5DC] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#9E7B4F]" />
              <h2 className="font-extrabold text-sm text-[#1A1D20]">Recent Invoices</h2>
            </div>
            <NavLink
              to="/invoices"
              className="text-xs font-bold text-[#9E7B4F] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {recentInvoices.length === 0 ? (
            <p className="text-xs text-[#718292] py-4 text-center">No invoices recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1A1D20]">{inv.invoiceNumber}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          inv.status === 'Paid'
                            ? 'bg-[#E6F7F0] text-[#1B9B6A]'
                            : inv.status === 'Partially Paid'
                            ? 'bg-[#FAF6F0] text-[#9E7B4F]'
                            : 'bg-[#FDF0F0] text-[#D9534F]'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#718292] truncate mt-0.5">
                      {inv.customerName || 'Customer'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-[#1A1D20]">{formatRupeeDoc(inv.grandTotal)}</p>
                    <p className="text-[10px] text-[#718292]">{formatInvoiceDate(inv.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quotations */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE5DC] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9E7B4F]" />
              <h2 className="font-extrabold text-sm text-[#1A1D20]">Recent Quotations</h2>
            </div>
            <NavLink
              to="/quotations"
              className="text-xs font-bold text-[#9E7B4F] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {recentQuotations.length === 0 ? (
            <p className="text-xs text-[#718292] py-4 text-center">No quotations recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentQuotations.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1A1D20]">{q.quotationNumber}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FAF6F0] text-[#9E7B4F]">
                        {q.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#718292] truncate mt-0.5">
                      {q.customerName || 'Customer'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-[#1A1D20]">{formatRupeeDoc(q.grandTotal)}</p>
                    <p className="text-[10px] text-[#718292]">{formatQuotationDate(q.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
