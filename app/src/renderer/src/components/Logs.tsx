import usePersistRoute from '@renderer/hooks/use-persist-route'
import EllipsisCircle from '@renderer/icons/EllipsisCircle'
import Trash from '@renderer/icons/Trash'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { ImperativePanelHandle } from 'react-resizable-panels'
import { useOutletContext, useParams } from 'react-router'
import MagnifyingGlassIcon from '../icons/MagnifyingGlass'
import SidebarLeftIcon from '../icons/SidebarLeft'
import type { Log as ILog, LogsResult } from '../types/log'
import classNames from '../utils/classnames'
import Log from './Log'
import { useDebounce } from '@uidotdev/usehooks'

export default function ProjectLogs() {
  usePersistRoute()

  const queryClient = useQueryClient()

  // URL state
  const { projectId } = useParams<{ projectId: string }>()

  // Outlet context
  const { sidebar, isSidebarOpen, isFullScreen } = useOutletContext<{
    sidebar: React.MutableRefObject<ImperativePanelHandle | null>
    isSidebarOpen: boolean
    isFullScreen: boolean
  }>()

  // Local state
  const [logIdShowingContextMenu, setLogIdShowingContextMenu] = useState<string>()
  const [search, setSearch] = useState<string>('')

  const debouncedSearch = useDebounce(search.length > 2 ? search : '', 500)

  // Server state
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => window.api.getProject(projectId!),
    enabled: Boolean(projectId)
  })

  const {
    data: logs,
    isLoading: isLogsLoading,
    isError: isLogsError,
    error: logsError,
    refetch: refetchProjectLogs
  } = useQuery({
    queryKey: ['projects', projectId, 'logs'],
    queryFn: () => window.api.getProjectLogs(projectId!),
    enabled: Boolean(projectId)
  })

  const { mutate: mutateDeleteProjectLogs, isPending: isDeleteProjectLogsLoading } = useMutation({
    mutationFn: (data: { date?: Date }) =>
      window.api.deleteProjectLogs({
        projectId: projectId!,
        date: data.date
      }),
    onSettled: () => refetchProjectLogs()
  })

  const { mutateAsync: mutateDeleteLog } = useMutation({
    mutationFn: (logId: string) => window.api.deleteLog(logId),
    onSettled: () => refetchProjectLogs()
  })

  // Side-effects
  useEffect(() => {
    window.api.onNewLog(({ log: newLog, day }) => {
      if (newLog.project?.id !== projectId) {
        return
      }

      const existingLogs =
        queryClient.getQueryData<LogsResult>(['projects', projectId, 'logs']) || []

      if (existingLogs) {
        const dayLogs = existingLogs[day] ?? []

        delete existingLogs[day]

        queryClient.setQueryData(['projects', projectId, 'logs'], {
          [day]: [newLog, ...dayLogs],
          ...existingLogs
        })
      }
    })

    return (): void => {
      window.api.removeNewLogListeners()
    }
  }, [queryClient, projectId])

  useEffect(() => {
    const handleMenuItemClick = async (event: string, log: ILog): Promise<void> => {
      if (event === 'copy-log') {
        try {
          await navigator.clipboard.writeText(JSON.stringify(log, null, 2))
        } catch {
          window.alert('Failed to copy to clipboard')
        }
      } else if (event === 'copy-log-timestamp') {
        try {
          await navigator.clipboard.writeText(
            format(new Date(log.createdAt), 'MMM d yyyy, HH:mm:ss:SSS')
          )
        } catch {
          window.alert('Failed to copy to clipboard')
        }
      } else if (event === 'copy-log-content') {
        try {
          await navigator.clipboard.writeText(log.content.flatMap((item) => item.content).join(' '))
        } catch {
          window.alert('Failed to copy to clipboard')
        }
      } else if (event === 'copy-log-project') {
        try {
          await navigator.clipboard.writeText(log.project?.name ?? 'Not found') // TODO: Update
        } catch {
          window.alert('Failed to copy to clipboard')
        }
      } else if (event === 'copy-log-location') {
        try {
          await navigator.clipboard.writeText('Coming soon') // TODO: Update
        } catch {
          window.alert('Failed to copy to clipboard')
        }
      } else if (event === 'delete-log') {
        try {
          mutateDeleteLog(log.id)
        } catch {
          window.alert('Failed to copy to clipboard')
        }
      }
    }

    window.api.onLogMenuItemClicked(handleMenuItemClick)

    window.api.onCloseLogMenu(() => {
      setLogIdShowingContextMenu(undefined)
    })

    return (): void => {
      window.api.unregisterLogMenuListeners()
    }
  }, [])

  const filteredLogs = useMemo(() => {
    const _filteredLogs: Record<string, ILog[]> = {}

    if (logs) {
      Object.entries(logs).forEach(([key, logs]) => {
        _filteredLogs[key] = logs.filter((log) =>
          debouncedSearch
            ? log.content.some((item) =>
                item.content.toLowerCase().includes(debouncedSearch.toLowerCase())
              )
            : true
        )
      })
    }

    return _filteredLogs
  }, [logs, debouncedSearch])

  return (
    <>
      <div
        className={classNames(
          'drag flex items-center justify-between gap-3 py-3 h-[53px] bg-background-lighter',
          isSidebarOpen ? 'pl-6 pr-3' : isFullScreen ? 'px-3' : 'pr-3 pl-[81px]'
        )}
      >
        <div className="flex items-center gap-3">
          {!isSidebarOpen && (
            <button
              type="button"
              title="Toggle sidebar"
              className="no-drag group rounded-md hover:bg-foreground/5 transition duration-700 px-[9px] py-2"
              onClick={() => sidebar.current?.expand()}
            >
              <SidebarLeftIcon className="fill-foreground/40 group-active:fill-foreground transition w-6" />
            </button>
          )}
          <div className="space-y-1.5">
            <button
              type="button"
              className="text-[15px] font-medium leading-none text-left no-drag"
              onClick={() => {
                navigator.clipboard.writeText(projectId!)
              }}
            >
              {isProjectLoading ? 'Loading...' : project?.name || 'Unknown Project'}
            </button>
            <p className="text-sm text-foreground-muted leading-none">
              {isLogsLoading
                ? 'Loading logs...'
                : `${filteredLogs ? Object.values(filteredLogs).reduce((a, b) => a + b.length, 0) : 0} logs`}
            </p>
          </div>
        </div>
        <div className="no-drag flex items-center gap-4">
          <div className="relative  has-[:disabled]:cursor-not-allowed">
            <MagnifyingGlassIcon className="w-3.5 fill-foreground absolute top-1/2 left-2.5 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              id="search-projects"
              placeholder="Search"
              onChange={(e) => setSearch(e.currentTarget.value)}
              className="transition duration-150 w-56 rounded-md disabled:cursor-not-allowed py-1 pl-8 pr-2 bg-transparent border border-foreground/10 placeholder-foreground/20 focus:outline-none focus:ring-2 ring-primary/25"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              title={`Clear all logs for ${project?.name ?? 'project'}`}
              className="no-drag group rounded-md hover:bg-foreground/5 transition duration-700 px-[9px] py-2"
              disabled={isDeleteProjectLogsLoading}
              onClick={() => {
                if (!projectId) {
                  return
                }

                mutateDeleteProjectLogs({})
              }}
            >
              <Trash className="fill-foreground/40 group-active:fill-foreground transition h-5" />
            </button>

            <button
              type="button"
              title="More info"
              className="no-drag group rounded-md hover:bg-foreground/5 transition duration-700 px-[9px] py-2"
              onClick={() => {
                if (!project) {
                  return
                }

                window.api
                  .showProjectMenu(project)
                  .catch((err: unknown) => console.error('Failed to show context menu:', err))
              }}
            >
              <EllipsisCircle className="fill-foreground/40 group-active:fill-foreground transition h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex flex-col relative overflow-y-auto"
        style={{ height: 'calc(100% - 53px)' }}
      >
        <div className="grid grid-cols-10 bg-background px-4 sticky top-0 border-t border-border-light">
          <button
            type="button"
            title="Order by date"
            className="p-2 text-foreground-muted truncate text-left active:bg-background-lightest transition col-span-1"
          >
            Timestamp
          </button>
          <div className="p-2 col-span-6">
            <p className="text-foreground-muted truncate">Content</p>
          </div>
          <div className="p-2 flex">
            <p className="text-foreground-muted truncate">Project</p>
          </div>
          <div className="p-2">
            <p className="text-foreground-muted truncate">Location</p>
          </div>
        </div>

        {isLogsLoading && <p>Loading...</p>}
        {isLogsError && <p>Error: {logsError?.message || 'Unknown error'}</p>}
        {filteredLogs
          ? Object.entries(filteredLogs).map(([date, logs]) => (
              <Fragment key={date}>
                <div className="bg-background-lighter sticky top-[36px] border-y border-border-light pl-4 pr-3 py-0.5">
                  <div className="flex items-center justify-between">
                    <p className="p-2 text-foreground-muted text-sm uppercase tracking-wider font-light">
                      {date}
                    </p>

                    <button
                      type="button"
                      title={`Clear logs from ${date}`}
                      className="no-drag group rounded-md hover:bg-foreground/5 transition duration-700 px-[9px] py-1.5"
                      disabled={isDeleteProjectLogsLoading}
                      onClick={() => {
                        if (!projectId) {
                          return
                        }

                        mutateDeleteProjectLogs({
                          date: new Date(logs[0].createdAt)
                        })
                      }}
                    >
                      <Trash className="fill-foreground/40 group-active:fill-foreground transition h-5" />
                    </button>
                  </div>
                </div>

                {logs.map((log) => (
                  <Log
                    key={log.id}
                    log={log}
                    isShowingContextMenu={logIdShowingContextMenu === log.id}
                    onOpenContextMenu={() => {
                      setLogIdShowingContextMenu(log.id)
                      window.api
                        .showLogMenu(log)
                        .catch((err: unknown) => console.error('Failed to show context menu:', err))
                    }}
                  />
                ))}
              </Fragment>
            ))
          : null}
      </div>
    </>
  )
}
