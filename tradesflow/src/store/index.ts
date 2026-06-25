import { create } from 'zustand'
import type { Job, Engineer, Customer, Certificate } from '@/types'

interface AppStore {
  engineers: Engineer[]
  customers: Customer[]
  jobs: Job[]
  certificates: Certificate[]
  isOnline: boolean
  pendingSync: number
  setEngineers: (engineers: Engineer[]) => void
  setCustomers: (customers: Customer[]) => void
  setJobs: (jobs: Job[]) => void
  setCertificates: (certs: Certificate[]) => void
  setOnline: (online: boolean) => void
  setPendingSync: (count: number) => void
  addJob: (job: Job) => void
  updateJob: (id: string, updates: Partial<Job>) => void
}

export const useAppStore = create<AppStore>((set) => ({
  engineers: [],
  customers: [],
  jobs: [],
  certificates: [],
  isOnline: true,
  pendingSync: 0,
  setEngineers: (engineers) => set({ engineers }),
  setCustomers: (customers) => set({ customers }),
  setJobs: (jobs) => set({ jobs }),
  setCertificates: (certs) => set({ certificates: certs }),
  setOnline: (isOnline) => set({ isOnline }),
  setPendingSync: (pendingSync) => set({ pendingSync }),
  addJob: (job) => set((s) => ({ jobs: [...s.jobs, job] })),
  updateJob: (id, updates) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    })),
}))
