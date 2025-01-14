import { ipcRenderer, contextBridge, IpcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Project } from './types/project'
import { Log, LogsResult } from './types/log'

// Custom APIs for rendere
const api = {
  getProjects: (): Promise<Project[]> => ipcRenderer.invoke('get-projects'),
  getProject: (projectId: string): Promise<Project> => ipcRenderer.invoke('get-project', projectId),
  getProjectLogs: (projectId: string, search?: string): Promise<LogsResult> =>
    ipcRenderer.invoke('get-project-logs', projectId, search),
  deleteProjectLogs: (data: { projectId: string; date?: Date }): Promise<Log[]> =>
    ipcRenderer.invoke('delete-project-logs', data),
  deleteLog: (logId: string): Promise<Log> => ipcRenderer.invoke('delete-log', logId),
  createProject: async (name: string): Promise<Project> =>
    ipcRenderer.invoke('create-project', name),
  updateProject: async (
    projectId: string,
    values: {
      name?: string
    }
  ): Promise<Project> => ipcRenderer.invoke('update-project', projectId, values),
  deleteProject: async (projectId: string): Promise<Project> =>
    ipcRenderer.invoke('delete-project', projectId),
  openProjectLogStream: (projectId: string): Promise<Project[]> =>
    ipcRenderer.invoke('open-project-log-stream', projectId),
  onNewLog: (callback: (value: { log: Log; day: string }) => void): IpcRenderer =>
    ipcRenderer.on('new-log', (_event, value) => callback(value)),
  removeNewLogListeners: (): void => {
    ipcRenderer.removeAllListeners('new-log')
  },

  // Fullscreen
  onEnterFullScreen: (callback: () => void): IpcRenderer =>
    ipcRenderer.on('enter-full-screen', () => callback()),
  onLeaveFullScreen: (callback: () => void): IpcRenderer =>
    ipcRenderer.on('leave-full-screen', () => callback()),

  // Log menu
  showLogMenu: (log: Log): Promise<unknown> => ipcRenderer.invoke('show-log-menu', log),
  onLogMenuItemClicked: (callback: (action: string, log: Log) => void): IpcRenderer =>
    ipcRenderer.on('log-menu-item-clicked', (_, action: string, log: Log) => callback(action, log)),
  onCloseLogMenu: (callback: (logId: string) => void): IpcRenderer =>
    ipcRenderer.on('close-log-menu', (_, logId: string) => callback(logId)),
  unregisterLogMenuListeners: (): void => {
    ipcRenderer.removeAllListeners('log-menu-item-clicked')
    ipcRenderer.removeAllListeners('close-log-menu')
  },

  // Project menu
  showProjectMenu: (project: Project): Promise<unknown> =>
    ipcRenderer.invoke('show-project-menu', project),
  onProjectMenuItemClicked: (callback: (action: string, project: Project) => void): IpcRenderer =>
    ipcRenderer.on('project-menu-item-clicked', (_, action: string, project: Project) =>
      callback(action, project)
    ),
  onCloseProjectMenu: (callback: (projectId: string) => void): IpcRenderer =>
    ipcRenderer.on('close-project-menu', (_, projectId: string) => callback(projectId)),
  unregisterProjectMenuListeners: (): void => {
    ipcRenderer.removeAllListeners('project-menu-item-clicked')
    ipcRenderer.removeAllListeners('close-project-menu')
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

export type API = typeof api
