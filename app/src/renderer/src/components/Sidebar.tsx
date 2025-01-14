import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MutableRefObject, useEffect, useState } from 'react'
import { ImperativePanelHandle } from 'react-resizable-panels'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import ShippingBoxFillIcon from '../icons/ShippingBoxFill'
import SidebarLeftIcon from '../icons/SidebarLeft'
import cn from '../utils/classnames'
import { Project } from '@renderer/types/project'

type SidebarProps = {
  sidebar: MutableRefObject<ImperativePanelHandle | null>
  isFullScreen: boolean
}

const Sidebar = ({ sidebar, isFullScreen }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  // URL state
  const { projectId } = useParams<{ projectId: string }>()

  // Local state
  const [projectIdShowingContextMenu, setProjectIdShowingContextMenu] = useState<string>()
  const [renamingProjectId, setRenamingProjectId] = useState<string>()
  const [search] = useState('')

  // Server state
  const queryClient = useQueryClient()

  const { refetch: refetchProjects, data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => window.api.getProjects()
  })

  const { mutate: createProject, isPending: isCreateProjectPending } = useMutation({
    mutationFn: () => window.api.createProject('New project'),
    onSettled: () => refetchProjects()
  })

  const { mutate: updateProject } = useMutation({
    mutationFn: (data: { projectId: string; values: { name?: string } }) =>
      window.api.updateProject(data.projectId, data.values),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
    onSuccess: () => {
      setRenamingProjectId(undefined)
    },
    onError: () => {
      window.alert('Failed to update project')
    }
  })

  const { mutate: deleteProject } = useMutation({
    mutationFn: (projectId: string) => window.api.deleteProject(projectId),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
    onSuccess: (deletedProject) => {
      if (deletedProject?.id && location.pathname.includes(deletedProject.id)) {
        navigate('/')
      }
    },
    onError: () => {
      window.alert('Failed to delete project')
    }
  })

  // Filtered projects based on search input
  const filteredProjects = projects.filter((project: { name: string }) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  )

  // Side-effects
  useEffect(() => {
    const handleProjectMenuItemClick = async (event: string, project: Project): Promise<void> => {
      if (event === 'rename') {
        setRenamingProjectId(project.id)
      } else if (event === 'delete') {
        deleteProject(project.id)
      }
    }

    window.api.onProjectMenuItemClicked(handleProjectMenuItemClick)

    window.api.onCloseProjectMenu(() => {
      setProjectIdShowingContextMenu(undefined)
    })

    return (): void => {
      window.api.unregisterProjectMenuListeners()
    }
  }, [])

  return (
    <div id="sidebar" className="flex flex-col h-full">
      <div
        className={cn('h-[52px] flex items-center gap-3 drag', isFullScreen ? 'px-3' : 'pl-[82px]')}
      >
        <button
          type="button"
          title="Toggle sidebar"
          className="no-drag group rounded-md hover:bg-foreground/5 transition duration-700 px-[9px] py-2"
          onClick={() => {
            sidebar.current?.collapse()
          }}
        >
          <SidebarLeftIcon className="fill-foreground/40 group-active:fill-foreground transition w-6" />
        </button>
      </div>

      <div className="space-y-4 flex-1">
        <div className="px-3">
          <button
            type="button"
            id="new-project"
            className="transition duration-150 border border-border-lighter w-full rounded-md py-1 px-4 bg-background-lightest active:bg-background-lightest-hover active:border-border-lighter-hover shadow-sm shadow-background truncate"
            disabled={isCreateProjectPending}
            onClick={() => {
              createProject()
            }}
          >
            New project
          </button>
        </div>

        <div className="px-3 space-y-1.5 w-full">
          <p className="text-foreground-muted text-sm font-medium mx-2">Projects</p>

          {projects?.length > 0 ? (
            <div>
              {filteredProjects.map((project) => {
                return renamingProjectId === project.id ? (
                  <div
                    key={project.id}
                    className={cn(
                      'flex items-center gap-2.5 text-left py-1.5 px-3 w-full rounded-md transition border',
                      project.id === projectId ? 'bg-background-lightest' : 'bg-background-lighter',
                      projectIdShowingContextMenu === project.id
                        ? 'border-primary'
                        : project.id === projectId
                          ? 'border-background-lightest'
                          : 'border-background-lighter'
                    )}
                  >
                    <ShippingBoxFillIcon className="min-w-4 w-4 max-w-4 fill-primary" />
                    <div className="max-w-full">
                      <input
                        autoFocus
                        role="textbox"
                        contentEditable
                        defaultValue={project.name}
                        className="w-full bg-transparent outline-primary"
                        onFocus={(e) => {
                          e.currentTarget.selectionStart = 0
                          e.currentTarget.selectionEnd = e.currentTarget.value.length
                        }}
                        onBlur={async (e) => {
                          const newName = e.currentTarget.value

                          if (newName !== project.name && newName) {
                            updateProject({
                              projectId: project.id,
                              values: {
                                name: newName
                              }
                            })
                          } else {
                            setRenamingProjectId(undefined)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (['Enter', 'Escape'].includes(e.key)) {
                            e.currentTarget.blur()
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <Link
                    onContextMenu={() => {
                      setProjectIdShowingContextMenu(project.id)

                      window.api
                        .showProjectMenu(project)
                        .catch((err: unknown) => console.error('Failed to show context menu:', err))
                    }}
                    to={`/${project.id}`}
                    key={project.id}
                    className={cn(
                      'flex items-center gap-2.5 text-left py-1.5 px-3 w-full rounded-md transition border',
                      project.id === projectId ? 'bg-background-lightest' : 'bg-background-lighter',
                      projectIdShowingContextMenu === project.id
                        ? 'border-primary'
                        : project.id === projectId
                          ? 'border-background-lightest'
                          : 'border-background-lighter'
                    )}
                  >
                    <ShippingBoxFillIcon className="w-4 fill-primary" />
                    <p className="truncate flex-1">{project.name}</p>
                  </Link>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-5"></div>
    </div>
  )
}

export default Sidebar
