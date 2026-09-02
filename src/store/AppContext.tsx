import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CompanySettings,
  Customer,
  ServicePrice,
  Lead,
  Quotation,
  Booking,
  Invoice,
  Payment,
  Expense,
} from '../types';
import {
  initialSettings,
  initialCustomers,
  initialServicePrices,
  initialLeads,
  initialQuotations,
  initialBookings,
  initialInvoices,
  initialPayments,
  initialExpenses,
} from './initialData';
import {
  customerService,
  leadService,
  quotationService,
  bookingService,
  invoiceService,
  paymentService,
  expenseService,
  serviceService,
  settingsService,
  counterService,
} from '../services';
import { isFirebaseConfigured, db } from '../lib/firebase';
import {
  determineInvoiceStatus,
  calculateBalanceDue,
  calculateGrandTotal,
} from '../utils/calculations';

interface AppState {
  settings: CompanySettings;
  customers: Customer[];
  servicePrices: ServicePrice[];
  leads: Lead[];
  quotations: Quotation[];
  bookings: Booking[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  isLoading: boolean;
  isFirebaseActive: boolean;
}

interface AppContextType extends AppState {
  // Settings & Services
  updateSettings: (settings: CompanySettings) => Promise<void>;
  updateServicePrices: (services: ServicePrice[]) => Promise<void>;
  addService: (service: ServicePrice) => Promise<ServicePrice>;
  updateService: (service: ServicePrice) => Promise<ServicePrice>;
  deleteService: (id: string) => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;

  // Customers
  addCustomer: (customer: Customer) => Promise<Customer>;
  updateCustomer: (customer: Customer) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;

  // Leads
  addLead: (lead: Lead) => Promise<Lead>;
  updateLead: (lead: Lead) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;

  // Quotations
  addQuotation: (quotation: Quotation) => Promise<Quotation>;
  updateQuotation: (quotation: Quotation) => Promise<Quotation>;
  deleteQuotation: (id: string) => Promise<void>;
  generateNextQuotationNumber: () => Promise<string>;

  // Bookings
  addBooking: (booking: Booking) => Promise<Booking>;
  updateBooking: (booking: Booking) => Promise<Booking>;
  deleteBooking: (id: string) => Promise<void>;
  generateNextBookingNumber: () => Promise<string>;

  // Invoices
  addInvoice: (invoice: Invoice) => Promise<Invoice>;
  updateInvoice: (invoice: Invoice) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  generateNextInvoiceNumber: () => Promise<string>;

  // Payments (Atomic Transaction Operations)
  addPayment: (payment: Payment) => Promise<{ success: boolean; error?: string }>;
  updatePayment: (payment: Payment) => Promise<{ success: boolean; error?: string }>;
  deletePayment: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Expenses
  addExpense: (expense: Expense) => Promise<Expense>;
  updateExpense: (expense: Expense) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;

  // Clean Production VS Explicit Demo Seed
  resetToCleanState: () => Promise<void>;
  resetToDemoData: () => Promise<void>;
  reloadFromFirestore: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings>(initialSettings);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isFirebaseActive = Boolean(db && isFirebaseConfigured());

  // Authoritative Initial Load from Firestore
  const reloadFromFirestore = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseActive) {
        // Load all collections directly from Firestore
        const [
          remoteSettings,
          remoteCustomers,
          remoteLeads,
          remoteQuotes,
          remoteBookings,
          remoteInvoices,
          remotePayments,
          remoteExpenses,
          remoteServices,
        ] = await Promise.all([
          settingsService.getSettings().catch(() => null),
          customerService.getAll().catch(() => []),
          leadService.getAll().catch(() => []),
          quotationService.getAll().catch(() => []),
          bookingService.getAll().catch(() => []),
          invoiceService.getAll().catch(() => []),
          paymentService.getAll().catch(() => []),
          expenseService.getAll().catch(() => []),
          serviceService.getAll().catch(() => []),
        ]);

        if (remoteSettings) {
          setSettings((prev) => ({ ...prev, ...remoteSettings }));
        }
        setCustomers(remoteCustomers);
        setLeads(remoteLeads);
        setQuotations(remoteQuotes);
        setBookings(remoteBookings);
        setInvoices(remoteInvoices);
        setPayments(remotePayments);
        setExpenses(remoteExpenses);
        setServicePrices(remoteServices.length > 0 ? remoteServices : initialServicePrices);
      } else {
        // Fallback for offline/unconfigured local development environment
        const savedSettings = localStorage.getItem('mkm_settings');
        const savedCustomers = localStorage.getItem('mkm_customers');
        const savedLeads = localStorage.getItem('mkm_leads');
        const savedQuotations = localStorage.getItem('mkm_quotations');
        const savedBookings = localStorage.getItem('mkm_bookings');
        const savedInvoices = localStorage.getItem('mkm_invoices');
        const savedPayments = localStorage.getItem('mkm_payments');
        const savedExpenses = localStorage.getItem('mkm_expenses');
        const savedServices = localStorage.getItem('mkm_services');

        if (savedSettings) setSettings(JSON.parse(savedSettings));
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
        else setCustomers(initialCustomers);
        if (savedLeads) setLeads(JSON.parse(savedLeads));
        else setLeads(initialLeads);
        if (savedQuotations) setQuotations(JSON.parse(savedQuotations));
        else setQuotations(initialQuotations);
        if (savedBookings) setBookings(JSON.parse(savedBookings));
        else setBookings(initialBookings);
        if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
        else setInvoices(initialInvoices);
        if (savedPayments) setPayments(JSON.parse(savedPayments));
        else setPayments(initialPayments);
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        else setExpenses(initialExpenses);
        if (savedServices) setServicePrices(JSON.parse(savedServices));
        else setServicePrices(initialServicePrices);
      }
    } catch (error) {
      console.error('Failed to load authoritative data from Firestore:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadFromFirestore();
  }, []);

  // ==================== TRANSACTION-BASED NUMBER COUNTERS ====================
  const generateNextInvoiceNumber = async (): Promise<string> => {
    try {
      if (isFirebaseActive) {
        return await counterService.getNextInvoiceNumber(
          settings.invoicePrefix || 'INV-',
          settings.invoiceStartNumber || 1000
        );
      }
    } catch (e) {
      console.warn('Counter service unavailable, calculating from existing:', e);
    }
    const prefix = settings.invoicePrefix || 'INV-';
    const numbers = invoices
      .map((inv) => {
        const num = parseInt(inv.invoiceNumber.replace(/\D/g, ''), 10);
        return isNaN(num) ? 0 : num;
      })
      .filter((n) => n > 0);
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : settings.invoiceStartNumber || 1000;
    return `${prefix}${maxNum + 1}`;
  };

  const generateNextQuotationNumber = async (): Promise<string> => {
    try {
      if (isFirebaseActive) {
        return await counterService.getNextQuotationNumber(
          settings.quotationPrefix || 'QT-',
          settings.quotationStartNumber || 500
        );
      }
    } catch (e) {
      console.warn('Quotation counter service unavailable:', e);
    }
    const prefix = settings.quotationPrefix || 'QT-';
    const numbers = quotations
      .map((q) => {
        const num = parseInt(q.quotationNumber.replace(/\D/g, ''), 10);
        return isNaN(num) ? 0 : num;
      })
      .filter((n) => n > 0);
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : settings.quotationStartNumber || 500;
    return `${prefix}${maxNum + 1}`;
  };

  const generateNextBookingNumber = async (): Promise<string> => {
    try {
      if (isFirebaseActive) {
        return await counterService.getNextBookingNumber('BKG-', 100);
      }
    } catch (e) {
      console.warn('Booking counter service unavailable:', e);
    }
    const numbers = bookings
      .map((b) => {
        const num = parseInt(b.bookingNumber.replace(/\D/g, ''), 10);
        return isNaN(num) ? 0 : num;
      })
      .filter((n) => n > 0);
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 100;
    return `BKG-${maxNum + 1}`;
  };

  // ==================== SETTINGS & SERVICES (FIRESTORE FIRST) ====================
  const updateSettings = async (newSettings: CompanySettings): Promise<void> => {
    const updated = { ...newSettings, updatedAt: new Date().toISOString() };
    if (isFirebaseActive) {
      await settingsService.updateSettings(updated);
    }
    setSettings(updated);
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const logoUrl = await settingsService.uploadLogo(file);
    const updated = { ...settings, logoUrl, updatedAt: new Date().toISOString() };
    if (isFirebaseActive) {
      await settingsService.updateSettings(updated);
    }
    setSettings(updated);
    return logoUrl;
  };

  const updateServicePrices = async (services: ServicePrice[]): Promise<void> => {
    if (isFirebaseActive) {
      for (const s of services) {
        await serviceService.update(s);
      }
    }
    setServicePrices(services);
  };

  const addService = async (service: ServicePrice): Promise<ServicePrice> => {
    let created = service;
    if (isFirebaseActive) {
      created = await serviceService.create(service);
    }
    setServicePrices((prev) => [created, ...prev]);
    return created;
  };

  const updateService = async (service: ServicePrice): Promise<ServicePrice> => {
    let updated = service;
    if (isFirebaseActive) {
      updated = await serviceService.update(service);
    }
    setServicePrices((prev) => prev.map((s) => (s.id === service.id ? updated : s)));
    return updated;
  };

  const deleteService = async (id: string): Promise<void> => {
    if (isFirebaseActive) {
      await serviceService.delete(id);
    }
    setServicePrices((prev) => prev.filter((s) => s.id !== id));
  };

  // ==================== CUSTOMERS (FIRESTORE FIRST) ====================
  const addCustomer = async (customer: Customer): Promise<Customer> => {
    let created = customer;
    if (isFirebaseActive) {
      created = await customerService.create(customer);
    }
    setCustomers((prev) => [created, ...prev]);
    return created;
  };

  const updateCustomer = async (customer: Customer): Promise<Customer> => {
    let updated = customer;
    if (isFirebaseActive) {
      updated = await customerService.update(customer);
    }
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? updated : c)));
    return updated;
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    if (isFirebaseActive) {
      await customerService.delete(id);
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // ==================== LEADS (FIRESTORE FIRST) ====================
  const addLead = async (lead: Lead): Promise<Lead> => {
    let created = lead;
    if (isFirebaseActive) {
      created = await leadService.create(lead);
    }
    setLeads((prev) => [created, ...prev]);
    return created;
  };

  const updateLead = async (lead: Lead): Promise<Lead> => {
    let updated = lead;
    if (isFirebaseActive) {
      updated = await leadService.update(lead);
    }
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? updated : l)));
    return updated;
  };

  const deleteLead = async (id: string): Promise<void> => {
    if (isFirebaseActive) {
      await leadService.delete(id);
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  // ==================== QUOTATIONS (FIRESTORE FIRST) ====================
  const addQuotation = async (quotation: Quotation): Promise<Quotation> => {
    let created = quotation;
    if (isFirebaseActive) {
      created = await quotationService.create(quotation);
    }
    setQuotations((prev) => [created, ...prev]);
    return created;
  };

  const updateQuotation = async (quotation: Quotation): Promise<Quotation> => {
    let updated = quotation;
    if (isFirebaseActive) {
      updated = await quotationService.update(quotation);
    }
    setQuotations((prev) => prev.map((q) => (q.id === quotation.id ? updated : q)));
    return updated;
  };

  const deleteQuotation = async (id: string): Promise<void> => {
    if (isFirebaseActive) {
      await quotationService.delete(id);
    }
    setQuotations((prev) => prev.filter((q) => q.id !== id));
  };

  // ==================== BOOKINGS (FIRESTORE FIRST) ====================
  const addBooking = async (booking: Booking): Promise<Booking> => {
    let created = booking;
    if (isFirebaseActive) {
      created = await bookingService.create(booking);
    }
    setBookings((prev) => [created, ...prev]);
    return created;
  };

  const updateBooking = async (booking: Booking): Promise<Booking> => {
    let updated = booking;
    if (isFirebaseActive) {
      updated = await bookingService.update(booking);
    }
    setBookings((prev) => prev.map((b) => (b.id === booking.id ? updated : b)));
    return updated;
  };

  const deleteBooking = async (id: string): Promise<void> => {
    if (isFirebaseActive) {
      await bookingService.delete(id);
    }
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  // ==================== INVOICES (FIRESTORE FIRST & SAFE DELETE) ====================
  const addInvoice = async (invoice: Invoice): Promise<Invoice> => {
    const now = new Date().toISOString();
    const grandTotal =
      invoice.grandTotal ||
      calculateGrandTotal(invoice.subtotal, invoice.discount, invoice.tax ? settings.taxRate : 0);
    const amountPaid = invoice.amountPaid || 0;
    const balanceDue = calculateBalanceDue(grandTotal, amountPaid);
    const status = determineInvoiceStatus(grandTotal, amountPaid, invoice.dueDate);

    const newInvoice: Invoice = {
      ...invoice,
      grandTotal,
      amountPaid,
      balanceDue,
      status,
      createdAt: invoice.createdAt || now,
      updatedAt: now,
    };

    let created = newInvoice;
    if (isFirebaseActive) {
      created = await invoiceService.create(newInvoice);
    }
    setInvoices((prev) => [created, ...prev]);
    return created;
  };

  const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
    const now = new Date().toISOString();
    const grandTotal =
      invoice.grandTotal ||
      calculateGrandTotal(invoice.subtotal, invoice.discount, invoice.tax ? settings.taxRate : 0);
    const amountPaid = invoice.amountPaid || 0;
    const balanceDue = calculateBalanceDue(grandTotal, amountPaid);
    const status = determineInvoiceStatus(grandTotal, amountPaid, invoice.dueDate);

    const updatedInvoice: Invoice = {
      ...invoice,
      grandTotal,
      amountPaid,
      balanceDue,
      status,
      updatedAt: now,
    };

    let updated = updatedInvoice;
    if (isFirebaseActive) {
      updated = await invoiceService.update(updatedInvoice);
    }
    setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? updated : i)));
    return updated;
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    if (isFirebaseActive) {
      // Safe deletion: checks for payments and throws if payments exist
      await invoiceService.deleteInvoiceSafely(id);
    }
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // ==================== PAYMENTS (STRICT TRANSACTION ATOMICITY) ====================
  const addPayment = async (payment: Payment): Promise<{ success: boolean; error?: string }> => {
    try {
      const payAmount = Number(payment.amount);
      if (isNaN(payAmount) || payAmount <= 0) {
        return { success: false, error: 'Payment amount must be greater than zero.' };
      }

      if (isFirebaseActive) {
        // Atomic transaction: Writes payment doc + updates invoice ledger simultaneously
        const { payment: createdPayment, updatedInvoice } =
          await paymentService.recordPaymentAtomic(payment);

        setPayments((prev) => [createdPayment, ...prev]);
        setInvoices((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)));
        return { success: true };
      } else {
        const targetInvoice = invoices.find((inv) => inv.id === payment.invoiceId);
        if (!targetInvoice) {
          return { success: false, error: 'Referenced invoice could not be found.' };
        }
        if (payAmount > targetInvoice.balanceDue) {
          return {
            success: false,
            error: `Payment cannot exceed current balance due of ₹${targetInvoice.balanceDue.toLocaleString('en-IN')}.`,
          };
        }

        const now = new Date().toISOString();
        const newPayment: Payment = {
          ...payment,
          amount: payAmount,
          createdAt: payment.createdAt || now,
          updatedAt: now,
        };

        const newAmountPaid = targetInvoice.amountPaid + payAmount;
        const newBalanceDue = calculateBalanceDue(targetInvoice.grandTotal, newAmountPaid);
        const newStatus = determineInvoiceStatus(targetInvoice.grandTotal, newAmountPaid, targetInvoice.dueDate);

        const updatedInvoice = {
          ...targetInvoice,
          amountPaid: newAmountPaid,
          balanceDue: newBalanceDue,
          status: newStatus,
          updatedAt: now,
        };

        setPayments((prev) => [newPayment, ...prev]);
        setInvoices((prev) => prev.map((inv) => (inv.id === targetInvoice.id ? updatedInvoice : inv)));
        return { success: true };
      }
    } catch (error: any) {
      console.error('Payment atomic transaction error:', error);
      return { success: false, error: error?.message || 'Unable to record payment.' };
    }
  };

  const updatePayment = async (payment: Payment): Promise<{ success: boolean; error?: string }> => {
    try {
      const payAmount = Number(payment.amount);
      if (isNaN(payAmount) || payAmount <= 0) {
        return { success: false, error: 'Payment amount must be greater than zero.' };
      }

      if (isFirebaseActive) {
        // Atomic transaction: updates payment document and recalculates invoice ledger directly in Firestore
        const { updatedPayment, updatedInvoice } = await paymentService.updatePaymentAtomic(
          payment.id,
          payment
        );

        setPayments((prev) => prev.map((p) => (p.id === payment.id ? updatedPayment : p)));
        setInvoices((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)));
        return { success: true };
      } else {
        const now = new Date().toISOString();
        const updatedPayments = payments.map((p) => (p.id === payment.id ? { ...payment, updatedAt: now } : p));
        const invoicePayments = updatedPayments.filter((p) => p.invoiceId === payment.invoiceId);
        const totalPaid = invoicePayments.reduce((sum, p) => sum + p.amount, 0);

        const targetInvoice = invoices.find((inv) => inv.id === payment.invoiceId);
        if (targetInvoice) {
          const balance = calculateBalanceDue(targetInvoice.grandTotal, totalPaid);
          const status = determineInvoiceStatus(targetInvoice.grandTotal, totalPaid, targetInvoice.dueDate);
          const updatedInv = {
            ...targetInvoice,
            amountPaid: totalPaid,
            balanceDue: balance,
            status,
            updatedAt: now,
          };
          setPayments(updatedPayments);
          setInvoices((prev) => prev.map((inv) => (inv.id === payment.invoiceId ? updatedInv : inv)));
        }
        return { success: true };
      }
    } catch (err: any) {
      console.error('Payment update error:', err);
      return { success: false, error: err?.message || 'Unable to update payment.' };
    }
  };

  const deletePayment = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseActive) {
        const { deletedPaymentId, updatedInvoice } = await paymentService.deletePaymentAtomic(id);
        setPayments((prev) => prev.filter((p) => p.id !== deletedPaymentId));
        if (updatedInvoice) {
          setInvoices((prev) => prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)));
        }
      } else {
        const paymentToDelete = payments.find((p) => p.id === id);
        if (!paymentToDelete) return { success: false, error: 'Payment not found.' };

        const remainingPayments = payments.filter((p) => p.id !== id);
        setPayments(remainingPayments);

        const invoicePayments = remainingPayments.filter((p) => p.invoiceId === paymentToDelete.invoiceId);
        const totalPaid = invoicePayments.reduce((sum, p) => sum + p.amount, 0);

        const targetInvoice = invoices.find((inv) => inv.id === paymentToDelete.invoiceId);
        if (targetInvoice) {
          const balance = calculateBalanceDue(targetInvoice.grandTotal, totalPaid);
          const status = determineInvoiceStatus(targetInvoice.grandTotal, totalPaid, targetInvoice.dueDate);
          const updatedInv = {
            ...targetInvoice,
            amountPaid: totalPaid,
            balanceDue: balance,
            status,
            updatedAt: new Date().toISOString(),
          };
          setInvoices((prev) => prev.map((inv) => (inv.id === paymentToDelete.invoiceId ? updatedInv : inv)));
        }
      }
      return { success: true };
    } catch (err: any) {
      console.error('Payment delete error:', err);
      return { success: false, error: err?.message || 'Unable to delete payment.' };
    }
  };

  // ==================== EXPENSES (FIRESTORE FIRST) ====================
  const addExpense = async (expense: Expense): Promise<Expense> => {
    let created = expense;
    if (isFirebaseActive) {
      created = await expenseService.create(expense);
    }
    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  const updateExpense = async (expense: Expense): Promise<Expense> => {
    let updated = expense;
    if (isFirebaseActive) {
      updated = await expenseService.update(expense);
    }
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? updated : e)));
    return updated;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    if (isFirebaseActive) {
      await expenseService.delete(id);
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // ==================== CLEAN PRODUCTION VS DEMO SEED ====================
  const resetToCleanState = async (): Promise<void> => {
    setCustomers([]);
    setLeads([]);
    setQuotations([]);
    setBookings([]);
    setInvoices([]);
    setPayments([]);
    setExpenses([]);
    localStorage.removeItem('mkm_customers');
    localStorage.removeItem('mkm_leads');
    localStorage.removeItem('mkm_quotations');
    localStorage.removeItem('mkm_bookings');
    localStorage.removeItem('mkm_invoices');
    localStorage.removeItem('mkm_payments');
    localStorage.removeItem('mkm_expenses');
  };

  const resetToDemoData = async (): Promise<void> => {
    setSettings(initialSettings);
    setCustomers(initialCustomers);
    setServicePrices(initialServicePrices);
    setLeads(initialLeads);
    setQuotations(initialQuotations);
    setBookings(initialBookings);
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setExpenses(initialExpenses);

    if (isFirebaseActive) {
      try {
        await settingsService.updateSettings(initialSettings);
        for (const c of initialCustomers) await customerService.create(c).catch(() => null);
        for (const l of initialLeads) await leadService.create(l).catch(() => null);
        for (const q of initialQuotations) await quotationService.create(q).catch(() => null);
        for (const b of initialBookings) await bookingService.create(b).catch(() => null);
        for (const i of initialInvoices) await invoiceService.create(i).catch(() => null);
        for (const p of initialPayments) await paymentService.create(p).catch(() => null);
        for (const e of initialExpenses) await expenseService.create(e).catch(() => null);
        for (const s of initialServicePrices) await serviceService.create(s).catch(() => null);
      } catch (e) {
        console.warn('Demo data sync notice:', e);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        customers,
        servicePrices,
        leads,
        quotations,
        bookings,
        invoices,
        payments,
        expenses,
        isLoading,
        isFirebaseActive,
        updateSettings,
        updateServicePrices,
        addService,
        updateService,
        deleteService,
        uploadLogo,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addLead,
        updateLead,
        deleteLead,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        generateNextQuotationNumber,
        addBooking,
        updateBooking,
        deleteBooking,
        generateNextBookingNumber,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        generateNextInvoiceNumber,
        addPayment,
        updatePayment,
        deletePayment,
        addExpense,
        updateExpense,
        deleteExpense,
        resetToCleanState,
        resetToDemoData,
        reloadFromFirestore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
