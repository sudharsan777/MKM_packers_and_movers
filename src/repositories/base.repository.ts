import { BaseEntity } from '../types';

export interface IRepository<T extends BaseEntity> {
  getAll(): T[];
  getById(id: string): T | null;
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & Partial<BaseEntity>): T;
  update(item: T): T;
  delete(id: string): boolean;
  clear(): void;
  setAll(items: T[]): void;
}

export class LocalStorageRepository<T extends BaseEntity> implements IRepository<T> {
  private storageKey: string;
  private defaultItems: T[];

  constructor(storageKey: string, defaultItems: T[] = []) {
    this.storageKey = storageKey;
    this.defaultItems = defaultItems;
  }

  private load(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        this.save(this.defaultItems);
        return this.defaultItems;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error loading data for ${this.storageKey}:`, e);
      return this.defaultItems;
    }
  }

  private save(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.error(`Error saving data for ${this.storageKey}:`, e);
    }
  }

  getAll(): T[] {
    return this.load();
  }

  getById(id: string): T | null {
    const items = this.load();
    return items.find((item) => item.id === id) || null;
  }

  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & Partial<BaseEntity>): T {
    const items = this.load();
    const now = new Date().toISOString();
    const newItem = {
      ...item,
      id: item.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: item.createdAt || now,
      updatedAt: now,
    } as T;

    items.unshift(newItem);
    this.save(items);
    return newItem;
  }

  update(item: T): T {
    const items = this.load();
    const index = items.findIndex((i) => i.id === item.id);
    const updated = {
      ...item,
      updatedAt: new Date().toISOString(),
    };

    if (index !== -1) {
      items[index] = updated;
    } else {
      items.unshift(updated);
    }

    this.save(items);
    return updated;
  }

  delete(id: string): boolean {
    const items = this.load();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length !== items.length) {
      this.save(filtered);
      return true;
    }
    return false;
  }

  clear(): void {
    this.save([]);
  }

  setAll(items: T[]): void {
    this.save(items);
  }
}
