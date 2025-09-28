import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Database operations
  db: {
    getJobApplications: (page: number, limit: number, status?: string, search?: string) =>
      ipcRenderer.invoke('db:getJobApplications', page, limit, status, search),
    
    getJobApplication: (id: string) =>
      ipcRenderer.invoke('db:getJobApplication', id),
    
    createJobApplication: (job: any) =>
      ipcRenderer.invoke('db:createJobApplication', job),
    
    updateJobApplication: (id: string, updates: any) =>
      ipcRenderer.invoke('db:updateJobApplication', id, updates),
    
    deleteJobApplication: (id: string) =>
      ipcRenderer.invoke('db:deleteJobApplication', id)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
