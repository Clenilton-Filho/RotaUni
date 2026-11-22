import { asyncStorageAdapter } from '@/storage/async-storage.adapter';

export type DataSource = 'http' | 'mock';
const STORAGE_KEY = 'rotauni.data-source';
let runtimeDataSource: DataSource = process.env.EXPO_PUBLIC_DATA_SOURCE === 'mock' ? 'mock' : 'http';
export function getRuntimeDataSource() { return runtimeDataSource; }
export function setRuntimeDataSource(source: DataSource) { runtimeDataSource = source; }

export function getInitialDataSource(): DataSource {
  return process.env.EXPO_PUBLIC_DATA_SOURCE === 'mock' ? 'mock' : 'http';
}

export async function readDataSource(): Promise<DataSource> {
  const stored = await asyncStorageAdapter.get<DataSource>(STORAGE_KEY);
  return stored === 'mock' || stored === 'http' ? stored : getInitialDataSource();
}

export function saveDataSource(source: DataSource) {
  return asyncStorageAdapter.set(STORAGE_KEY, source);
}
