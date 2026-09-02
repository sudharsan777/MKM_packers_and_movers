import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Payment, Invoice } from '../types';
import { calculateBalanceDue, determineInvoiceStatus } from '../utils/calculations';

const PAYMENTS_COLLECTION = 'payments';
const INVOICES_COLLECTION = 'invoices';

export const paymentService = {
  async getAll(): Promise<Payment[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, PAYMENTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt || new Date().toISOString(),
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt,
        } as Payment;
      });
    } catch (error: any) {
      console.error('Error fetching payments from Firestore:', error);
      throw new Error(error?.message || 'Unable to load payments. Please check your connection and try again.');
    }
  },

  async getById(id: string): Promise<Payment | null> {
    if (!db) return null;
    try {
      const docRef = doc(db, PAYMENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt || new Date().toISOString(),
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
      } as Payment;
    } catch (error: any) {
      console.error(`Error fetching payment ${id}:`, error);
      throw new Error('Unable to load payment details.');
    }
  },

  async getPaymentsByInvoiceId(invoiceId: string): Promise<Payment[]> {
    if (!db) return [];
    try {
      const q = query(
        collection(db, PAYMENTS_COLLECTION),
        where('invoiceId', '==', invoiceId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt || new Date().toISOString(),
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt,
        } as Payment;
      });
    } catch (error: any) {
      console.error(`Error fetching payments for invoice ${invoiceId}:`, error);
      throw new Error('Unable to load invoice payments.');
    }
  },

  async create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }): Promise<Payment> {
    const id = payment.id || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: payment.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (db) {
      const docRef = doc(db, PAYMENTS_COLLECTION, id);
      await setDoc(docRef, {
        ...newPayment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return newPayment;
  },

  /**
   * Atomic Payment Recording + Invoice Ledger Update via Firestore Transaction
   */
  async recordPaymentAtomic(paymentInput: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }): Promise<{ payment: Payment; updatedInvoice: Invoice }> {
    const payAmount = Number(paymentInput.amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const paymentId = paymentInput.id || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    if (!db) {
      throw new Error('Database is not initialized. Unable to record payment.');
    }

    const invoiceRef = doc(db, INVOICES_COLLECTION, paymentInput.invoiceId);
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);

    const result = await runTransaction(db, async (transaction) => {
      const invoiceDoc = await transaction.get(invoiceRef);
      if (!invoiceDoc.exists()) {
        throw new Error('Referenced invoice does not exist in database.');
      }

      const invoiceData = invoiceDoc.data() as Invoice;
      const currentPaid = Number(invoiceData.amountPaid) || 0;
      const grandTotal = Number(invoiceData.grandTotal) || 0;
      const currentBalance = calculateBalanceDue(grandTotal, currentPaid);

      if (payAmount > currentBalance) {
        throw new Error(
          `Payment amount (₹${payAmount.toLocaleString('en-IN')}) cannot exceed current balance due (₹${currentBalance.toLocaleString('en-IN')}).`
        );
      }

      const newAmountPaid = currentPaid + payAmount;
      const newBalanceDue = calculateBalanceDue(grandTotal, newAmountPaid);
      const newStatus = determineInvoiceStatus(grandTotal, newAmountPaid, invoiceData.dueDate);

      const newPaymentRecord: Payment = {
        ...paymentInput,
        id: paymentId,
        amount: payAmount,
        createdAt: paymentInput.createdAt || nowIso,
        updatedAt: nowIso,
      };

      const updatedInvoiceRecord: Invoice = {
        ...invoiceData,
        id: invoiceDoc.id,
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
        updatedAt: nowIso,
      };

      // 1. Write Payment document
      transaction.set(paymentRef, {
        ...newPaymentRecord,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Update Invoice document atomically
      transaction.update(invoiceRef, {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      return { payment: newPaymentRecord, updatedInvoice: updatedInvoiceRecord };
    });

    return result;
  },

  /**
   * Atomic Payment Update + Invoice Ledger Recalculation via Firestore Transaction
   */
  async updatePaymentAtomic(
    paymentId: string,
    updatedFields: Partial<Omit<Payment, 'id' | 'createdAt'>>
  ): Promise<{ updatedPayment: Payment; updatedInvoice: Invoice }> {
    if (!db) {
      throw new Error('Database is not initialized. Unable to update payment.');
    }

    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);

    return runTransaction(db, async (transaction) => {
      // 1. Read payment doc in transaction
      const paymentDoc = await transaction.get(paymentRef);
      if (!paymentDoc.exists()) {
        throw new Error('Payment record not found.');
      }

      const existingPaymentData = paymentDoc.data() as Payment;
      const invoiceId = existingPaymentData.invoiceId;
      const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);

      // 2. Read associated invoice doc in transaction
      const invoiceDoc = await transaction.get(invoiceRef);
      if (!invoiceDoc.exists()) {
        throw new Error('Associated invoice does not exist in database.');
      }

      const invoiceData = invoiceDoc.data() as Invoice;
      const oldAmount = Number(existingPaymentData.amount) || 0;
      const newAmount = updatedFields.amount !== undefined ? Number(updatedFields.amount) : oldAmount;

      if (isNaN(newAmount) || newAmount <= 0) {
        throw new Error('Payment amount must be greater than zero.');
      }

      // 3. Recalculate invoice ledger using authoritative Firestore state
      const delta = newAmount - oldAmount;
      const currentPaid = Number(invoiceData.amountPaid) || 0;
      const grandTotal = Number(invoiceData.grandTotal) || 0;
      const newAmountPaid = currentPaid + delta;

      if (newAmountPaid > grandTotal) {
        const maxAllowed = grandTotal - (currentPaid - oldAmount);
        throw new Error(
          `Updated payment of ₹${newAmount.toLocaleString('en-IN')} exceeds invoice total. Maximum allowed amount is ₹${maxAllowed.toLocaleString('en-IN')}.`
        );
      }
      if (newAmountPaid < 0) {
        throw new Error('Calculated total paid cannot be negative.');
      }

      const newBalanceDue = calculateBalanceDue(grandTotal, newAmountPaid);
      const newStatus = determineInvoiceStatus(grandTotal, newAmountPaid, invoiceData.dueDate);
      const nowIso = new Date().toISOString();

      const updatedPaymentRecord: Payment = {
        ...existingPaymentData,
        ...updatedFields,
        id: paymentId,
        amount: newAmount,
        updatedAt: nowIso,
      };

      const updatedInvoiceRecord: Invoice = {
        ...invoiceData,
        id: invoiceDoc.id,
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
        updatedAt: nowIso,
      };

      // 4. Atomic Updates in Firestore
      transaction.update(paymentRef, {
        ...updatedFields,
        amount: newAmount,
        updatedAt: serverTimestamp(),
      });

      transaction.update(invoiceRef, {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      return { updatedPayment: updatedPaymentRecord, updatedInvoice: updatedInvoiceRecord };
    });
  },

  /**
   * Atomic Payment Delete + Invoice Ledger Recalculation via Firestore Transaction
   */
  async deletePaymentAtomic(paymentId: string): Promise<{ deletedPaymentId: string; updatedInvoice: Invoice | null }> {
    if (!db) {
      throw new Error('Database is not initialized. Unable to delete payment.');
    }

    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const paymentSnap = await getDoc(paymentRef);
    if (!paymentSnap.exists()) {
      throw new Error('Payment record not found.');
    }

    const paymentData = paymentSnap.data() as Payment;
    const invoiceId = paymentData.invoiceId;
    const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);

    return runTransaction(db, async (transaction) => {
      const invoiceSnap = await transaction.get(invoiceRef);
      
      // Delete payment document
      transaction.delete(paymentRef);

      if (!invoiceSnap.exists()) {
        return { deletedPaymentId: paymentId, updatedInvoice: null };
      }

      const invoiceData = invoiceSnap.data() as Invoice;
      const currentPaid = Number(invoiceData.amountPaid) || 0;
      const newAmountPaid = Math.max(0, currentPaid - (Number(paymentData.amount) || 0));
      const grandTotal = Number(invoiceData.grandTotal) || 0;
      const newBalanceDue = calculateBalanceDue(grandTotal, newAmountPaid);
      const newStatus = determineInvoiceStatus(grandTotal, newAmountPaid, invoiceData.dueDate);

      const nowIso = new Date().toISOString();
      const updatedInvoice: Invoice = {
        ...invoiceData,
        id: invoiceSnap.id,
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
        updatedAt: nowIso,
      };

      transaction.update(invoiceRef, {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      return { deletedPaymentId: paymentId, updatedInvoice };
    });
  },
};
