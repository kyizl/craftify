import { Keyv } from 'keyv';
import type { NetworkCache } from '@/client/cache/network-cache';

export class KeyvCache implements NetworkCache {
  private readonly store: Keyv;

  constructor(keyv: Keyv = new Keyv()) {
    this.store = keyv;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key);
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await this.store.set(key, value, ttlMs);
  }

  async delete(key: string): Promise<void> {
    await this.store.delete(key);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }
}
