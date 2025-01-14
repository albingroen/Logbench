import { useEffect } from 'react'
import { useLocation } from 'react-router'

const usePersistRoute = (): void => {
  const location = useLocation()

  useEffect(() => {
    // Save the current path to localStorage
    localStorage.setItem('lastRoute', location.pathname)
  }, [location]) // Runs whenever the route changes
}

export default usePersistRoute
