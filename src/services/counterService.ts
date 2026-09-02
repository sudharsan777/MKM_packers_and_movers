import {
  doc,
  runTransaction,
  getDoc,
  setDoc,
  Transaction,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const COUNTERS_COLLECTION = 'counters';

export interface CounterDoc {
  nextNumber: number;
  prefix?: string;
}

export const counterService = {
  /**
   * Generates next transaction-safe invoice number, reserving and incrementing counter in Firestore.
   */
  async getNextInvoiceNumber(prefix = 'INV-', startNumber = 1000): Promise<string> {
    if (!db) {
      return `${prefix}${startNumber + 1}`;
    }

    const counterRef = doc(db, COUNTERS_COLLECTION, 'invoices');
    return runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let currentNum = startNumber;

      if (counterDoc.exists()) {
        const data = counterDoc.data() as CounterDoc;
        currentNum = data.nextNumber || startNumber;
      }

      const assignedNum = currentNum + 1;
      transaction.set(counterRef, { nextNumber: assignedNum, prefix }, { merge: true });
      return `${prefix}${assignedNum}`;
    });
  },

  /**
   * Generates next transaction-safe quotation number.
   */
  async getNextQuotationNumber(prefix = 'QT-', startNumber = 500): Promise<string> {
    if (!db) {
      return `${prefix}${startNumber + 1}`;
    }

    const counterRef = doc(db, COUNTERS_COLLECTION, 'quotations');
    return runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let currentNum = startNumber;

      if (counterDoc.exists()) {
        const data = counterDoc.data() as CounterDoc;
        currentNum = data.nextNumber || startNumber;
      }

      const assignedNum = currentNum + 1;
      transaction.set(counterRef, { nextNumber: assignedNum, prefix }, { merge: true });
      return `${prefix}${assignedNum}`;
    });
  },

  /**
   * Generates next transaction-safe booking number.
   */
  async getNextBookingNumber(prefix = 'BKG-', startNumber = 100): Promise<string> {
    if (!db) {
      return `${prefix}${startNumber + 1}`;
    }

    const counterRef = doc(db, COUNTERS_COLLECTION, 'bookings');
    return runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let currentNum = startNumber;

      if (counterDoc.exists()) {
        const data = counterDoc.data() as CounterDoc;
        currentNum = data.nextNumber || startNumber;
      }

      const assignedNum = currentNum + 1;
      transaction.set(counterRef, { nextNumber: assignedNum, prefix }, { merge: true });
      return `${prefix}${assignedNum}`;
    });
  },
};
