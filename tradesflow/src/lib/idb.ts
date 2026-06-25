import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Job, Customer, Engineer } from '@/types'

interface TradesFlowDB extends DBSchema {
  jobs: { key: string; value: Job & { _offline?: boolean } }
  customers: { key: string; value: Customer }
  engineers: { key: string; value: Engineer }
  pendingActions: {
    key: number
    value: { action: string; table: string; data: Record<string, unknown>; timestamp: number }
    autoIncrement: true
  }
}

let db: IDBPDatabase<TradesFlowDB> | null = null

export async function getDB() {
  if (db) return db
  db = await openDB<TradesFlowDB>('tradesflow', 1, {
    upgrade(database) {
      database.createObjectStore('jobs', { keyPath: 'id' })
      database.createObjectStore('customers', { keyPath: 'id' })
      database.createObjectStore('engineers', { keyPath: 'id' })
      database.createObjectStore('pendingActions', { autoIncrement: true })
    },
  })
  return db
}

export async function cacheJobs(jobs: Job[]) {
  const database = await getDB()
  const tx = database.transaction('jobs', 'readwrite')
  await Promise.all(jobs.map((j) => tx.store.put(j)))
  await tx.done
}

export async function getCachedJobs(): Promise<Job[]> {
  const database = await getDB()
  return database.getAll('jobs')
}

export async function cacheCustomers(customers: Customer[]) {
  const database = await getDB()
  const tx = database.transaction('customers', 'readwrite')
  await Promise.all(customers.map((c) => tx.store.put(c)))
  await tx.done
}

export async function getCachedCustomers(): Promise<Customer[]> {
  const database = await getDB()
  return database.getAll('customers')
}

export async function cacheEngineers(engineers: Engineer[]) {
  const database = await getDB()
  const tx = database.transaction('engineers', 'readwrite')
  await Promise.all(engineers.map((e) => tx.store.put(e)))
  await tx.done
}

export async function getCachedEngineers(): Promise<Engineer[]> {
  const database = await getDB()
  return database.getAll('engineers')
}

export async function queueOfflineAction(action: string, table: string, data: Record<string, unknown>) {
  const database = await getDB()
  await database.add('pendingActions', { action, table, data, timestamp: Date.now() })
}

export async function getPendingActions() {
  const database = await getDB()
  return database.getAll('pendingActions')
}

export async function clearPendingActions() {
  const database = await getDB()
  await database.clear('pendingActions')
}
