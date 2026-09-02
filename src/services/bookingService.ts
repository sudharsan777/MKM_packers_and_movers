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
import { Booking } from '../types';

const COLLECTION_NAME = 'bookings';

export const bookingService = {
  async getAll(): Promise<Booking[]> {
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
        } as Booking;
      });
    } catch (error) {
      console.error('Error fetching bookings from Firestore:', error);
      throw new Error('Unable to load bookings. Please try again.');
    }
  },

  async getById(id: string): Promise<Booking | null> {
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
      } as Booking;
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw new Error('Unable to load booking details. Please try again.');
    }
  },

  async create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }): Promise<Booking> {
    const id = booking.id || `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    const newBooking: Booking = {
      ...booking,
      id,
      createdAt: booking.createdAt || nowIso,
      updatedAt: nowIso,
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await setDoc(docRef, {
          ...newBooking,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving booking to Firestore:', error);
        throw new Error('Unable to save booking. Please try again.');
      }
    }
    return newBooking;
  },

  async update(booking: Booking): Promise<Booking> {
    const updated: Booking = {
      ...booking,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, booking.id);
        await updateDoc(docRef, {
          ...booking,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error updating booking ${booking.id}:`, error);
        throw new Error('Unable to update booking. Please try again.');
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
        console.error(`Error deleting booking ${id}:`, error);
        throw new Error('Unable to delete booking. Please try again.');
      }
    }
    return true;
  },
};
