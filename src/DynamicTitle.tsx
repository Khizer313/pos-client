import  { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const DynamicTitle = () => {
    const location = useLocation()

    useEffect(() => {
      const path = location.pathname
      const title = path === '/dashboard' ? 'Dashboard' : path === '/home' ? 'Home' : 'Ahmed Computers'
      document.title = title
    }, [location])
  
  return (
    // this component is for showing different titles  based on current path of user
    null
  )
}

export default DynamicTitle
