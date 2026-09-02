import React, { useState } from 'react';
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
  Trash2,
  Fuel,
  Users,
  Package,
  Wrench,
  Shield,
  FileSpreadsheet,
  TrendingDown,
  RotateCcw,
} from 'lucide-react';
import { Expense } from '../types';

export const Expenses = () => {
  const { expenses, addExpense, deleteExpense } = useAppContext();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Fuel');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('Cash');
  const [notes, setNotes] = useState('');

  const categories = [
    'Fuel',
    'Driver & Labour Wages',
    'Packing Materials',
    'Vehicle Maintenance',
    'Toll & Parking',
    'Office & Rent',
    'Transit Insurance',
    'Marketing',
    'Utilities',
    'Other',
  ];

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount) || 0;
    if (amt <= 0 || !name.trim()) {
      toastError('Validation Error', 'Please enter a valid expense title and amount.');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      name: name.trim(),
      category,
      amount: amt,
      date,
      method,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await addExpense(newExpense);
      success('Expense Logged', `Recorded ${formatCurrency(amt)} for ${name}.`);
      setIsAddModalOpen(false);

      // Reset Form
      setName('');
      setAmount('');
      setNotes('');
    } catch (err: any) {
      toastError('Unable to Save Expense', err?.message || 'Unable to save. Please check your connection and try again.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      success('Expense Removed', 'The expense record was deleted.');
    } catch (err: any) {
      toastError('Unable to Delete Expense', err?.message || 'Unable to delete expense.');
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header Search & Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              id="expenses-search-input"
              type="text"
              placeholder="Search expenses by name, category, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <select
            id="expenses-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9.5 px-3 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-xl text-right">
            <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">
              Total Spent
            </span>
            <span className="text-sm font-black text-rose-700">{formatCurrency(totalExpenseAmount)}</span>
          </div>

          <Button
            id="btn-add-expense-modal"
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4 text-white" />}
            className="shrink-0 font-bold"
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Expenses Table */}
      <Card>
        {filteredExpenses.length === 0 ? (
          <EmptyState
            icon={<TrendingDown className="w-6 h-6 text-slate-400" />}
            title="No expense records found"
            description="Track operating costs including fuel, labour, toll taxes, packing carton boxes, and maintenance."
            actionLabel="Add Expense"
            onAction={() => setIsAddModalOpen(true)}
            actionIcon={<Plus className="w-3.5 h-3.5 mr-1" />}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Expense Title & Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  {/* Date */}
                  <TableCell>
                    <span className="font-semibold text-slate-900 whitespace-nowrap">
                      {formatDate(expense.date)}
                    </span>
                  </TableCell>

                  {/* Title & Notes */}
                  <TableCell>
                    <div>
                      <p className="font-bold text-slate-900">{expense.name}</p>
                      {expense.notes && (
                        <p className="text-[11px] text-slate-500 font-medium">{expense.notes}</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded text-[11px]">
                      {expense.category}
                    </span>
                  </TableCell>

                  {/* Method */}
                  <TableCell>
                    <span className="text-[11px] font-medium text-slate-600">
                      {expense.method}
                    </span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="text-right">
                    <span className="font-black text-rose-700 whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </span>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      title="Delete Record"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Operating Expense"
        subtitle="Record business outflow for fuel, labour, tolls, materials, or overheads"
        maxWidth="md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
          <Input
            label="Expense Title / Description *"
            placeholder="e.g. Diesel for Truck TN-01-AB-1234"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Expense Category *"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories.map((c) => ({ label: c, value: c }))}
            />
            <Input
              label="Amount (₹) *"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Expense Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Select
              label="Paid Via *"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              options={[
                { label: 'Cash', value: 'Cash' },
                { label: 'UPI / PhonePe', value: 'UPI' },
                { label: 'Debit / Fuel Card', value: 'Card' },
                { label: 'Bank Transfer', value: 'Bank Transfer' },
                { label: 'Other', value: 'Other' },
              ]}
            />
          </div>

          <Input
            label="Notes / Receipt Remarks"
            placeholder="e.g. 50 litres filled at HP Petrol Bunk, Salem Highway"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
