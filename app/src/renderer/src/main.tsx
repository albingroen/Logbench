import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router'
import RootLayout from './components/RootLayout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProjectLogs from './components/Logs'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route path=":projectId" element={<ProjectLogs />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
