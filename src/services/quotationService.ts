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
import { Quotation } from '../types';

const COLLECTION_NAME = 'quotations';

export const quotationService = {
  async getAll(): Promise<Quotation[]> {
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
        } as Quotation;
      });
    } catch (error) {
      console.error('Error fetching quotations from Firestore:', error);
      throw new Error('Unable to load quotations. Please try again.');
    }
  },

  async getById(id: string): Promise<Quotation | null> {
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
      } as Quotation;
    } catch (error) {
      console.error(`Error fetching quotation ${id}:`, error);
      throw new Error('Unable to load quotation details. Please try again.');
    }
  },

  async create(quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }): Promise<Quotation> {
    const id = quotation.id || `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const newQuotation: Quotation = {
      ...quotation,
      id,
      createdAt: quotation.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await setDoc(docRef, {
          ...newQuotation,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving quotation to Firestore:', error);
        throw new Error('Unable to save quotation. Please try again.');
      }
    }
    return newQuotation;
  },

  async update(quotation: Quotation): Promise<Quotation> {
    const updated: Quotation = {
      ...quotation,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, quotation.id);
        await updateDoc(docRef, {
          ...quotation,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error updating quotation ${quotation.id}:`, error);
        throw new Error('Unable to update quotation. Please try again.');
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
        console.error(`Error deleting quotation ${id}:`, error);
        throw new Error('Unable to delete quotation. Please try again.');
      }
    }
    return true;
  },
};
