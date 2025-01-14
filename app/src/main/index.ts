import icon from '../../resources/icon.png?asset'
import { BrowserWindow, Menu, app, clipboard, dialog, ipcMain, nativeTheme, shell } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'
import axios from 'axios'
import { io } from 'socket.io-client'
import { Log, LogsResult } from '../preload/types/log'
import { Project } from '../preload/types/project'
import { WORKER_URL } from '../shared/config'

const socket = io(WORKER_URL)

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    },
    darkTheme: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0C0D0D',
    trafficLightPosition: {
      x: 18,
      y: 19
    },
    minWidth: 640,
    minHeight: 360
  })

  nativeTheme.themeSource = 'dark'

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('enter-full-screen')
  })

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('leave-full-screen')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  socket.on('new-log', (log) => {
    mainWindow.webContents.send('new-log', log)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('show-log-menu', (event, log: Log) => {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Copy',
        submenu: [
          {
            label: 'Entire log',
            click: (): void => {
              event.sender.send('log-menu-item-clicked', 'copy-log', log)
            }
          },
          {
            label: 'Timestamp',
            click: (): void => {
              event.sender.send('log-menu-item-clicked', 'copy-log-timestamp', log)
            }
          },
          {
            label: 'Content',
            click: (): void => {
              event.sender.send('log-menu-item-clicked', 'copy-log-content', log)
            }
          },
          {
            label: 'Project',
            click: (): void => {
              event.sender.send('log-menu-item-clicked', 'copy-log-project', log)
            }
          },
          {
            label: 'Location',
            click: (): void => {
              event.sender.send('log-menu-item-clicked', 'copy-log-location', log)
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Delete log',
        click: (): void => {
          event.sender.send('log-menu-item-clicked', 'delete-log', log)
        }
      }
    ])

    const window = BrowserWindow.fromWebContents(event.sender)

    if (window) {
      menu.popup({ window })

      menu.on('menu-will-close', () => {
        window.webContents.send('close-log-menu', log)
      })
    }
  })

  ipcMain.handle('get-projects', async () => {
    return await axios.get(`${WORKER_URL}/projects`).then((res) => res.data)
  })

  ipcMain.handle('get-project', async (_, projectId: string) => {
    return await axios.get(`${WORKER_URL}/projects/${projectId}`).then((res) => res.data)
  })

  ipcMain.handle('get-project-logs', async (_, projectId: string, search: string = '') => {
    return await axios
      .get<LogsResult>(`${WORKER_URL}/projects/${projectId}/logs?search=${search}`)
      .then((res) => res.data)
  })

  ipcMain.handle('delete-project-logs', async (_, data: { projectId: string; date?: Date }) => {
    return await axios
      .delete(`${WORKER_URL}/projects/${data.projectId}/logs?date=${data.date ?? ''}`)
      .then((res) => res.data)
  })

  ipcMain.handle('delete-log', async (_, logId: string) => {
    return await axios.delete(`${WORKER_URL}/logs/${logId}`).then((res) => res.data)
  })

  ipcMain.handle('create-project', async (_, name: string) => {
    return await axios
      .post(`${WORKER_URL}/projects`, {
        name
      })
      .then((res) => res.data)
  })

  ipcMain.handle('update-project', async (_, projectId: string, values: { name?: string }) => {
    return await axios.put(`${WORKER_URL}/projects/${projectId}`, values).then((res) => res.data)
  })

  ipcMain.handle('delete-project', async (event, projectId: string) => {
    const window = BrowserWindow.fromWebContents(event.sender)

    if (!window) return

    const shouldDeleteProject = await dialog.showMessageBox(window, {
      message: 'Are you sure you want to delete this project?',
      detail: "You won't be able to get your project back.",
      buttons: ['Cancel', 'Delete project'],
      title: 'Delete project',
      type: 'warning'
    })

    if (shouldDeleteProject.response === 0) {
      return
    }

    return await axios.delete(`${WORKER_URL}/projects/${projectId}`).then((res) => res.data)
  })

  ipcMain.handle('show-project-menu', (event, project: Project) => {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Copy logs URL (POST)',
        click: (): void => {
          clipboard.writeText(`${WORKER_URL}/projects/${project.id}/logs`)
        }
      },
      {
        label: 'Rename project',
        click: (): void => {
          event.sender.send('project-menu-item-clicked', 'rename', project)
        }
      },
      { type: 'separator' },
      {
        label: 'Delete project...',
        click: (): void => {
          event.sender.send('project-menu-item-clicked', 'delete', project)
        }
      }
    ])

    const window = BrowserWindow.fromWebContents(event.sender)

    if (window) {
      menu.popup({ window })

      menu.on('menu-will-close', () => {
        window.webContents.send('close-project-menu', project)
      })
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
