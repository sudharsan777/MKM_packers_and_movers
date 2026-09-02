import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { CompanySettings } from '../types';

const COLLECTION_NAME = 'settings';
const SETTINGS_DOC_ID = 'company_profile';

export const settingsService = {
  async getSettings(): Promise<CompanySettings | null> {
    if (!db) return null;
    try {
      const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
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
      } as CompanySettings;
    } catch (error) {
      console.error('Error fetching settings from Firestore:', error);
      throw new Error('Unable to load company settings. Please try again.');
    }
  },

  async updateSettings(settings: CompanySettings): Promise<CompanySettings> {
    const updated: CompanySettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
        await setDoc(docRef, {
          ...settings,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (error) {
        console.error('Error saving settings to Firestore:', error);
        throw new Error('Unable to save settings. Please try again.');
      }
    }
    return updated;
  },

  async uploadLogo(file: File): Promise<string> {
    if (!storage) {
      // Local fallback: convert file to object URL / Base64 if storage is not connected
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const storageRef = ref(storage, `branding/logo_${Date.now()}.${fileExt}`);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/png',
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading logo to Firebase Storage:', error);
      throw new Error('Unable to upload company logo. Please try again.');
    }
  },
};
