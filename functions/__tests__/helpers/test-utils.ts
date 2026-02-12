import supertest from 'supertest';
import { app } from '../../src/app';
import { seedCollection, resetStore } from './mock-firestore';
import { resetStorage } from './mock-storage';
import { API_KEY_DOCS, TEST_KEYS } from './fixtures';

export function request() {
  return supertest(app);
}

export function authHeader(level: 'admin' | 'read_write' | 'read'): string {
  return `Bearer ${TEST_KEYS[level]}`;
}

export function seedApiKeys(): void {
  seedCollection('api-keys', API_KEY_DOCS);
}

export function resetAll(): void {
  resetStore();
  resetStorage();
}

/** Reset stores and seed API keys — call in beforeEach. */
export function setupTest(): void {
  resetAll();
  seedApiKeys();
}
