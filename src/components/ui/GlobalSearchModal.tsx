import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { useAppContext } from '../../store/AppContext';
import { SearchService } from '../../services/search.service';
import { SearchResultItem, EntityType } from '../../types';
import {
  Search,
  Receipt,
  Truck,
  FileText,
  User,
  CreditCard,
  TrendingDown,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import { Badge } from './Input';

export const GlobalSearchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { customers, leads, quotations, bookings, invoices, payments, expenses } = useAppContext();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const allResults = SearchService.searchAll(query, {
      customers,
      leads,
      quotations,
      bookings,
      invoices,
      payments,
      expenses,
    });

    if (filterType === 'ALL') {
      setResults(allResults);
    } else {
      setResults(allResults.filter((r) => r.type === filterType.toLowerCase()));
    }
  }, [query, filterType, customers, leads, quotations, bookings, invoices, payments, expenses]);

  const handleSelectResult = (item: SearchResultItem) => {
    onClose();
    navigate(item.url);
  };

  const getIcon = (type: EntityType) => {
    switch (type) {
      case 'invoice':
        return <Receipt className="w-4 h-4 text-indigo-600" />;
      case 'booking':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'quotation':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'lead':
        return <Sparkles className="w-4 h-4 text-sky-600" />;
      case 'customer':
        return <User className="w-4 h-4 text-purple-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-700" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-rose-600" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Global Business Search"
      subtitle="Search across all invoices, moving orders, quotes, leads, and customer records"
      maxWidth="2xl"
    >
      <div className="space-y-3.5 text-xs">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type customer name, invoice #, quote #, route, or phone..."
            className="w-full h-11 pl-10 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'INVOICE', label: 'Invoices' },
            { id: 'BOOKING', label: 'Orders' },
            { id: 'QUOTATION', label: 'Quotes' },
            { id: 'LEAD', label: 'Leads' },
            { id: 'CUSTOMER', label: 'Customers' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filterType === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto space-y-1.5 divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="text-center py-10 text-slate-400 space-y-1">
              <Search className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
              <p className="font-bold text-slate-600 text-xs">Search Everything in MKM Operations</p>
              <p className="text-[11px] text-slate-400">Quickly find records by customer name, phone number, quote #, or destination</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-1">
              <p className="font-bold text-slate-700 text-xs">No records matched "{query}"</p>
              <p className="text-[11px] text-slate-400">Check spelling or try searching by phone number or invoice number</p>
            </div>
          ) : (
            results.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelectResult(item)}
                className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-xs truncate">{item.title}</span>
                      <Badge variant={item.badgeVariant || 'neutral'} size="sm">
                        {item.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium truncate">{item.subtitle}</p>
                    <p className="text-[10px] text-slate-400">{item.meta}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-600 shrink-0">
                  <span className="text-[10px] font-bold hidden sm:inline">Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
