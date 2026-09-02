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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Invoice, Payment } from '../types';

const INVOICES_COLLECTION = 'invoices';
const PAYMENTS_COLLECTION = 'payments';

export const invoiceService = {
  async getAll(): Promise<Invoice[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, INVOICES_COLLECTION), orderBy('createdAt', 'desc'));
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
        } as Invoice;
      });
    } catch (error) {
      console.error('Error fetching invoices from Firestore:', error);
      throw new Error('Unable to load invoices. Please try again.');
    }
  },

  async getById(id: string): Promise<Invoice | null> {
    if (!db) return null;
    try {
      const docRef = doc(db, INVOICES_COLLECTION, id);
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
      } as Invoice;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw new Error('Unable to load invoice details. Please try again.');
    }
  },

  async create(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }): Promise<Invoice> {
    const id = invoice.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const newInvoice: Invoice = {
      ...invoice,
      id,
      createdAt: invoice.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (db) {
      try {
        const docRef = doc(db, INVOICES_COLLECTION, id);
        await setDoc(docRef, {
          ...newInvoice,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving invoice to Firestore:', error);
        throw new Error('Unable to save invoice. Please try again.');
      }
    }
    return newInvoice;
  },

  async update(invoice: Invoice): Promise<Invoice> {
    const updated: Invoice = {
      ...invoice,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const docRef = doc(db, INVOICES_COLLECTION, invoice.id);
        await updateDoc(docRef, {
          ...invoice,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error updating invoice ${invoice.id}:`, error);
        throw new Error('Unable to update invoice. Please try again.');
      }
    }
    return updated;
  },

  /**
   * Safe invoice deletion: Checks if payments are attached. If attached, refuses hard-deletion.
   */
  async deleteInvoiceSafely(id: string): Promise<boolean> {
    if (!db) return true;

    // Check for existing payments
    const paymentsQuery = query(
      collection(db, PAYMENTS_COLLECTION),
      where('invoiceId', '==', id)
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);

    if (!paymentsSnapshot.empty) {
      throw new Error(
        `Cannot delete invoice with ${paymentsSnapshot.size} recorded payment(s). Please void the invoice or remove payments first.`
      );
    }

    try {
      const docRef = doc(db, INVOICES_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error: any) {
      console.error(`Error deleting invoice ${id}:`, error);
      throw new Error(error?.message || 'Unable to delete invoice. Please try again.');
    }
  },
};
