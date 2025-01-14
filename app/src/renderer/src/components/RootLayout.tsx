import { PanelGroup, Panel, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels'
import { Outlet, useNavigate } from 'react-router'
import Sidebar from './Sidebar'
import { useEffect, useRef, useState } from 'react'

export default function RootLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const navigate = useNavigate()

  const sidebar = useRef<ImperativePanelHandle | null>(null)

  useEffect(() => {
    const lastRoute = localStorage.getItem('lastRoute')
    if (lastRoute) {
      navigate(lastRoute, { replace: true })
    }
  }, [])

  useEffect(() => {
    window.api.onEnterFullScreen(() => {
      setIsFullScreen(true)
    })

    window.api.onLeaveFullScreen(() => {
      setIsFullScreen(false)
    })
  }, [])

  return (
    <div className="h-screen">
      <PanelGroup direction="horizontal" className="h-full" autoSaveId="@layouts/main">
        {/* Sidebar Panel */}
        <Panel
          ref={sidebar}
          collapsible
          minSize={10}
          defaultSize={20}
          maxSize={40}
          onCollapse={() => setIsSidebarOpen(false)}
          onExpand={() => setIsSidebarOpen(true)}
          className="bg-background-lighter"
        >
          <Sidebar sidebar={sidebar} isFullScreen={isFullScreen} />
        </Panel>

        {/* Panel Resizer */}
        <PanelResizeHandle
          className="px-1 -mx-1 flex items-center justify-center z-10"
          onDoubleClick={() => {
            sidebar.current?.resize(20) // Resize to 20% width
          }}
        >
          <div className="w-px h-full bg-black"></div>
        </PanelResizeHandle>

        {/* Logs Panel */}
        <Panel className="flex flex-col">
          <Outlet context={{ sidebar, isSidebarOpen, isFullScreen }} />
        </Panel>
      </PanelGroup>
    </div>
  )
}
