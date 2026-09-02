import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Expense } from '../types';

const COLLECTION_NAME = 'expenses';

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
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
        } as Expense;
      });
    } catch (error) {
      console.error('Error fetching expenses from Firestore:', error);
      throw new Error('Unable to load expenses. Please try again.');
    }
  },

  async getById(id: string): Promise<Expense | null> {
    if (!db) return null;
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
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
      } as Expense;
    } catch (error) {
      console.error(`Error fetching expense ${id}:`, error);
      throw new Error('Unable to load expense details. Please try again.');
    }
  },

  async create(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }): Promise<Expense> {
    const id = expense.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id,
      createdAt: expense.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await setDoc(docRef, {
          ...newExpense,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving expense to Firestore:', error);
        throw new Error('Unable to save expense. Please try again.');
      }
    }
    return newExpense;
  },

  async update(expense: Expense): Promise<Expense> {
    const updated: Expense = {
      ...expense,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, expense.id);
        await updateDoc(docRef, {
          ...expense,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error updating expense ${expense.id}:`, error);
        throw new Error('Unable to update expense. Please try again.');
      }
    }
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        console.error(`Error deleting expense ${id}:`, error);
        throw new Error('Unable to delete expense. Please try again.');
      }
    }
    return true;
  },
};
