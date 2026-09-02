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
import { Customer } from '../types';

const COLLECTION_NAME = 'customers';

export const customerService = {
  async getAll(): Promise<Customer[]> {
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
        } as Customer;
      });
    } catch (error) {
      console.error('Error fetching customers from Firestore:', error);
      throw new Error('Unable to load customers. Please try again.');
    }
  },

  async getById(id: string): Promise<Customer | null> {
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
      } as Customer;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw new Error('Unable to load customer details. Please try again.');
    }
  },

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }): Promise<Customer> {
    const id = customer.id || `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const newCustomer: Customer = {
      ...customer,
      id,
      createdAt: customer.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await setDoc(docRef, {
          ...newCustomer,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving customer to Firestore:', error);
        throw new Error('Unable to save customer. Please try again.');
      }
    }
    return newCustomer;
  },

  async update(customer: Customer): Promise<Customer> {
    const updated: Customer = {
      ...customer,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, customer.id);
        await updateDoc(docRef, {
          ...customer,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error updating customer ${customer.id}:`, error);
        throw new Error('Unable to update customer. Please try again.');
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
        console.error(`Error deleting customer ${id}:`, error);
        throw new Error('Unable to delete customer. Please try again.');
      }
    }
    return true;
  },
};
