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
import { Lead } from '../types';

const COLLECTION_NAME = 'leads';

export const leadService = {
  async getAll(): Promise<Lead[]> {
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
        } as Lead;
      });
    } catch (error) {
      console.error('Error fetching leads from Firestore:', error);
      throw new Error('Unable to load leads. Please try again.');
    }
  },

  async getById(id: string): Promise<Lead | null> {
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
      } as Lead;
    } catch (error) {
      console.error(`Error fetching lead ${id}:`, error);
      throw new Error('Unable to load lead details. Please try again.');
    }
  },

  async create(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }): Promise<Lead> {
    const id = lead.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const newLead: Lead = {
      ...lead,
      id,
      createdAt: lead.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await setDoc(docRef, {
          ...newLead,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving lead to Firestore:', error);
        throw new Error('Unable to save lead. Please try again.');
      }
    }
    return newLead;
  },

  async update(lead: Lead): Promise<Lead> {
    const updated: Lead = {
      ...lead,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, lead.id);
        await updateDoc(docRef, {
          ...lead,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error updating lead ${lead.id}:`, error);
        throw new Error('Unable to update lead. Please try again.');
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
        console.error(`Error deleting lead ${id}:`, error);
        throw new Error('Unable to delete lead. Please try again.');
      }
    }
    return true;
  },
};
