import { ElectronAPI } from '@electron-toolkit/preload'

interface DatabaseAPI {
  getJobApplications: (page: number, limit: number, status?: string, search?: string) => Promise<any>
  getJobApplication: (id: string) => Promise<any>
  createJobApplication: (job: any) => Promise<any>
  updateJobApplication: (id: string, updates: any) => Promise<any>
  deleteJobApplication: (id: string) => Promise<any>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      db: DatabaseAPI
    }
  }
}
