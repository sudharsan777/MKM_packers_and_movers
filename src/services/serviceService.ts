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
import { ServicePrice } from '../types';

const COLLECTION_NAME = 'services';

export const serviceService = {
  async getAll(): Promise<ServicePrice[]> {
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
        } as ServicePrice;
      });
    } catch (error) {
      console.error('Error fetching services from Firestore:', error);
      throw new Error('Unable to load service prices. Please try again.');
    }
  },

  async getById(id: string): Promise<ServicePrice | null> {
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
      } as ServicePrice;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      throw new Error('Unable to load service details. Please try again.');
    }
  },

  async create(service: Omit<ServicePrice, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }): Promise<ServicePrice> {
    const id = service.id || `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const newService: ServicePrice = {
      ...service,
      id,
      createdAt: service.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await setDoc(docRef, {
          ...newService,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving service to Firestore:', error);
        throw new Error('Unable to save service price. Please try again.');
      }
    }
    return newService;
  },

  async update(service: ServicePrice): Promise<ServicePrice> {
    const updated: ServicePrice = {
      ...service,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, service.id);
        await updateDoc(docRef, {
          ...service,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error updating service ${service.id}:`, error);
        throw new Error('Unable to update service price. Please try again.');
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
        console.error(`Error deleting service ${id}:`, error);
        throw new Error('Unable to delete service price. Please try again.');
      }
    }
    return true;
  },
};
